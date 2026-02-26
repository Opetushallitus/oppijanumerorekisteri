package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

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
    var tiedote = createTiedoteRequest();

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
    var tiedote = createTiedoteRequest(idempotencyKey);
    var returnedId = postTiedoteRequestAndReturnTiedoteId(tiedote);

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(1, tiedotteet.size());
    Tiedote saved = tiedotteet.stream().filter(t -> t.getId().equals(returnedId)).findFirst().get();
    assertEquals(saved.getId(), returnedId);
    assertEquals("1.2.246.562.99.12345678901", saved.getOppijanumero());
    assertEquals(idempotencyKey, saved.getIdempotencyKey());
  }

  @Test
  public void createTiedoteFailsWhenFieldsAreMissing() throws Exception {
    performValidPostRequest(
            """
                   { "oppijanumero": "1.2.246.562.99.12345678901" }
                   """)
        .andExpect(status().isBadRequest());

    performValidPostRequest(
            """
                   { "idempotencyKey": "some-key" }
                   """)
        .andExpect(status().isBadRequest());
  }

  @Test
  public void createTiedoteWithSameIdempotencyKeyReturnsSameId() throws Exception {
    tiedoteRepository.deleteAll();
    String idempotencyKey = UUID.randomUUID().toString();
    var tiedote = createTiedoteRequest(idempotencyKey);
    var firstId = postTiedoteRequestAndReturnTiedoteId(tiedote);
    var secondId = postTiedoteRequestAndReturnTiedoteId(tiedote);

    assertEquals(firstId, secondId);

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(1, tiedotteet.size());
    assertEquals(idempotencyKey, tiedotteet.get(0).getIdempotencyKey());
  }

  @Test
  public void createTiedoteWithDifferentIdempotencyKeysCreatesDifferentRecords() throws Exception {
    tiedoteRepository.deleteAll();
    var tiedote1 = createTiedoteRequest();
    var tiedote2 = createTiedoteRequest();

    var firstId = postTiedoteRequestAndReturnTiedoteId(tiedote1);
    var secondId = postTiedoteRequestAndReturnTiedoteId(tiedote2);

    assertEquals(false, firstId.equals(secondId));

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(2, tiedotteet.size());
  }

  private @NonNull UUID postTiedoteRequestAndReturnTiedoteId(TiedoteRequest tiedote)
      throws Exception {
    var response =
        performValidPostRequest(objectMapper.writeValueAsString(tiedote))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    return UUID.fromString(objectMapper.readTree(response).get("id").asText());
  }

  private TiedoteRequest createTiedoteRequest() {
    return createTiedoteRequest(UUID.randomUUID().toString());
  }

  private TiedoteRequest createTiedoteRequest(String idempotencyKey) {
    return new TiedoteRequest("1.2.246.562.99.12345678901", idempotencyKey);
  }

  private @NonNull ResultActions performValidPostRequest(String content) throws Exception {
    return mockMvc.perform(
        post("/api/v1/tiedote/kielitutkintotodistus")
            .with(validToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(content));
  }

  private SecurityMockMvcRequestPostProcessors.@NonNull JwtRequestPostProcessor validToken() {
    return jwt()
        .authorities(
            new SimpleGrantedAuthority(
                ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD));
  }
}

record TiedoteRequest(String oppijanumero, String idempotencyKey) {}
