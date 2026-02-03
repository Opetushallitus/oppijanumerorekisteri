package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
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

  @Test
  public void createTiedoteRequiresAuthentication() throws Exception {
    mockMvc
        .perform(post("/api/v1/tiedotteet").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void createTiedoteFailsWithoutRequiredRole() throws Exception {
    Map<String, String> data = new HashMap<>();
    data.put("oppijanumero", "1.2.246.562.99.12345678901");
    data.put("titleFi", "Otsikko");
    data.put("titleSv", "Rubrik");
    data.put("titleEn", "Title");
    data.put("messageFi", "Viesti");
    data.put("messageSv", "Meddelande");
    data.put("messageEn", "Message");
    data.put("idempotencyKey", UUID.randomUUID().toString());

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(jwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(data)))
        .andExpect(status().isForbidden());
  }

  @Test
  public void createTiedoteSucceedsWithValidData() throws Exception {
    tiedoteRepository.deleteAll();
    String idempotencyKey = UUID.randomUUID().toString();
    Map<String, String> data = new HashMap<>();
    data.put("oppijanumero", "1.2.246.562.99.12345678901");
    data.put("titleFi", "Otsikko");
    data.put("titleSv", "Rubrik");
    data.put("titleEn", "Title");
    data.put("messageFi", "Viesti");
    data.put("messageSv", "Meddelande");
    data.put("messageEn", "Message");
    data.put("idempotencyKey", idempotencyKey);

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(
                    jwt().authorities(new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(data)))
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
                    .content(objectMapper.writeValueAsString(data)))
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
    Map<String, String> data = new HashMap<>();
    data.put("oppijanumero", "1.2.246.562.99.12345678901");
    data.put("titleFi", "Otsikko");
    data.put("titleSv", "Rubrik");
    data.put("titleEn", "Title");
    data.put("messageFi", "Viesti");
    data.put("messageSv", "Meddelande");
    data.put("messageEn", "Message");
    data.put("idempotencyKey", idempotencyKey);

    String firstResponse =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(data)))
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
                    .content(objectMapper.writeValueAsString(data)))
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

    Map<String, String> data1 = new HashMap<>();
    data1.put("oppijanumero", "1.2.246.562.99.12345678901");
    data1.put("titleFi", "Otsikko 1");
    data1.put("titleSv", "Rubrik 1");
    data1.put("titleEn", "Title 1");
    data1.put("messageFi", "Viesti 1");
    data1.put("messageSv", "Meddelande 1");
    data1.put("messageEn", "Message 1");
    data1.put("idempotencyKey", UUID.randomUUID().toString());

    Map<String, String> data2 = new HashMap<>();
    data2.put("oppijanumero", "1.2.246.562.99.12345678901");
    data2.put("titleFi", "Otsikko 2");
    data2.put("titleSv", "Rubrik 2");
    data2.put("titleEn", "Title 2");
    data2.put("messageFi", "Viesti 2");
    data2.put("messageSv", "Meddelande 2");
    data2.put("messageEn", "Message 2");
    data2.put("idempotencyKey", UUID.randomUUID().toString());

    String firstResponse =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(data1)))
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
                    .content(objectMapper.writeValueAsString(data2)))
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
