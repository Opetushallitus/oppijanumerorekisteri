package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class ApiControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private TiedoteRepository tiedoteRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  private Map<String, String> createTiedote(String idempotencyKey) {
    return Map.of(
        "oppijanumero", "1.2.246.562.99.12345678901",
        "url", "https://example.invalid/tiedote",
        "titleFi", "Otsikko",
        "titleSv", "Rubrik",
        "titleEn", "Title",
        "messageFi", "Viesti",
        "messageSv", "Meddelande",
        "messageEn", "Message",
        "idempotencyKey", idempotencyKey);
  }

  @Test
  public void createTiedoteRequiresAuthentication() throws Exception {
    mockMvc
        .perform(post("/api/v1/tiedotteet").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void createTiedoteFailsWithoutRequiredRole() throws Exception {
    var tiedote = createTiedote(UUID.randomUUID().toString());

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(jwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tiedote)))
        .andExpect(status().isForbidden());
  }

  @Test
  public void createTiedoteSucceedsWithValidData() throws Exception {
    tiedoteRepository.deleteAll();
    String idempotencyKey = UUID.randomUUID().toString();
    var tiedote = createTiedote(idempotencyKey);

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(
                    jwt().authorities(new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tiedote)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").exists());

    String responseBody =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(tiedote)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID returnedId = UUID.fromString(objectMapper.readTree(responseBody).get("id").asText());

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(1, tiedotteet.size());
    Tiedote saved = tiedotteet.stream().filter(t -> t.getId().equals(returnedId)).findFirst().get();
    assertEquals(saved.getId(), returnedId);
    assertEquals("1.2.246.562.99.12345678901", saved.getOppijanumero());
    assertEquals("https://example.invalid/tiedote", saved.getUrl());
    assertEquals("Otsikko", saved.getTitleFi());
    assertEquals("Rubrik", saved.getTitleSv());
    assertEquals("Title", saved.getTitleEn());
    assertEquals("Viesti", saved.getMessageFi());
    assertEquals("Meddelande", saved.getMessageSv());
    assertEquals("Message", saved.getMessageEn());
    assertEquals(idempotencyKey, saved.getIdempotencyKey());
  }

  @Test
  public void createTiedoteFailsWhenFieldsAreMissing() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(
                    jwt().authorities(new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oppijanumero", "1.2.246.562.99.12345678901"))))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(
                    jwt().authorities(new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("titleFi", "Otsikko"))))
        .andExpect(status().isBadRequest());
  }

  @Test
  public void createTiedoteWithSameIdempotencyKeyReturnsSameId() throws Exception {
    tiedoteRepository.deleteAll();
    String idempotencyKey = UUID.randomUUID().toString();
    var tiedote = createTiedote(idempotencyKey);

    String firstResponse =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(tiedote)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID firstId = UUID.fromString(objectMapper.readTree(firstResponse).get("id").asText());

    String secondResponse =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(tiedote)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID secondId = UUID.fromString(objectMapper.readTree(secondResponse).get("id").asText());

    assertEquals(firstId, secondId);

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(1, tiedotteet.size());
    assertEquals(idempotencyKey, tiedotteet.get(0).getIdempotencyKey());
  }

  @Test
  public void createTiedoteWithDifferentIdempotencyKeysCreatesDifferentRecords() throws Exception {
    tiedoteRepository.deleteAll();
    var tiedote1 = createTiedote(UUID.randomUUID().toString());
    var tiedote2 = createTiedote(UUID.randomUUID().toString());

    String firstResponse =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(tiedote1)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID firstId = UUID.fromString(objectMapper.readTree(firstResponse).get("id").asText());

    String secondResponse =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(tiedote2)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID secondId = UUID.fromString(objectMapper.readTree(secondResponse).get("id").asText());
    assertEquals(false, firstId.equals(secondId));

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(2, tiedotteet.size());
  }
}
