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

import org.jspecify.annotations.NonNull;
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
  private static final String ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD =
      "ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD";

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private TiedoteRepository tiedoteRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  @Test
  public void createTiedoteRequiresAuthentication() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void createTiedoteFailsWithoutRequiredRole() throws Exception {
    var tiedote = createTiedote();

    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
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
            post("/api/v1/tiedote/kielitutkintotodistus")
                .with(
                    jwt()
                        .authorities(
                            new SimpleGrantedAuthority(
                                ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tiedote)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").exists());

    String responseBody =
        mockMvc
            .perform(
                post("/api/v1/tiedote/kielitutkintotodistus")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority(
                                    ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD)))
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
    assertEquals(idempotencyKey, saved.getIdempotencyKey());
  }

  @Test
  public void createTiedoteFailsWhenFieldsAreMissing() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .with(
                    jwt()
                        .authorities(
                            new SimpleGrantedAuthority(
                                ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oppijanumero", "1.2.246.562.99.12345678901"))))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .with(
                    jwt()
                        .authorities(
                            new SimpleGrantedAuthority(
                                ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("idempotencyKey", "some-key"))))
        .andExpect(status().isBadRequest());
  }

  @Test
  public void createTiedoteWithSameIdempotencyKeyReturnsSameId() throws Exception {
    tiedoteRepository.deleteAll();
    String idempotencyKey = UUID.randomUUID().toString();
    var tiedote = createTiedote(idempotencyKey);

    String firstResponse = postTiedote(tiedote);

    UUID firstId = UUID.fromString(objectMapper.readTree(firstResponse).get("id").asText());

    String secondResponse = postTiedote(tiedote);

    UUID secondId = UUID.fromString(objectMapper.readTree(secondResponse).get("id").asText());

    assertEquals(firstId, secondId);

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(1, tiedotteet.size());
    assertEquals(idempotencyKey, tiedotteet.get(0).getIdempotencyKey());
  }

  private @NonNull String postTiedote(Map<String, String> tiedote) throws Exception {
    return mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .with(
                    jwt()
                        .authorities(
                            new SimpleGrantedAuthority(
                                ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tiedote)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").exists())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }

  @Test
  public void createTiedoteWithDifferentIdempotencyKeysCreatesDifferentRecords() throws Exception {
    tiedoteRepository.deleteAll();
    var tiedote1 = createTiedote();
    var tiedote2 = createTiedote();

    String firstResponse = postTiedote(tiedote1);

    UUID firstId = UUID.fromString(objectMapper.readTree(firstResponse).get("id").asText());

    String secondResponse = postTiedote(tiedote2);

    UUID secondId = UUID.fromString(objectMapper.readTree(secondResponse).get("id").asText());
    assertEquals(false, firstId.equals(secondId));

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(2, tiedotteet.size());
  }

  private Map<String, String> createTiedote() {
    return createTiedote(UUID.randomUUID().toString());
  }

  private Map<String, String> createTiedote(String idempotencyKey) {
    return Map.of("oppijanumero", "1.2.246.562.99.12345678901", "idempotencyKey", idempotencyKey);
  }
}
