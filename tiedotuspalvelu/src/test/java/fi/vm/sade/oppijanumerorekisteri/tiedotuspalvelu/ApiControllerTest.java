package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

public class ApiControllerTest extends TiedotuspalveluApiTest {

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

    var tokenWithoutRole = createSignedJwt(Map.of());
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenWithoutRole)
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

    mockMvc
        .perform(get("/api/v1/tiedote/" + returnedId).with(validToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(returnedId.toString()))
        .andExpect(jsonPath("$.meta.type").value("KIELITUTKINTOTODISTUS"))
        .andExpect(jsonPath("$.meta.state").value("NEW"))
        .andExpect(jsonPath("$.statuses[0].status").value("CREATED"))
        .andExpect(jsonPath("$.statuses[0].timestamp").exists());
  }

  @Test
  public void createTiedoteFailsWhenFieldsAreMissing() throws Exception {
    performAuthorizedPostRequest(
            """
                   { "oppijanumero": "1.2.246.562.99.12345678901" }
                   """)
        .andExpect(status().isBadRequest());

    performAuthorizedPostRequest(
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

  @Test
  public void createTiedoteReturnsEnrichedResponse() throws Exception {
    tiedoteRepository.deleteAll();
    String idempotencyKey = UUID.randomUUID().toString();
    var tiedote = createTiedoteRequest(idempotencyKey);

    performAuthorizedPostRequest(objectMapper.writeValueAsString(tiedote))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").exists())
        .andExpect(jsonPath("$.meta.type").value("KIELITUTKINTOTODISTUS"))
        .andExpect(jsonPath("$.meta.state").value("NEW"))
        .andExpect(jsonPath("$.statuses").isArray())
        .andExpect(jsonPath("$.statuses[0].status").value("CREATED"))
        .andExpect(jsonPath("$.statuses[0].timestamp").exists());
  }

  @Test
  public void getTiedoteReturns404ForUnknownId() throws Exception {
    mockMvc
        .perform(get("/api/v1/tiedote/" + UUID.randomUUID()).with(validToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  public void getTiedoteRequiresAuthentication() throws Exception {
    mockMvc
        .perform(get("/api/v1/tiedote/" + UUID.randomUUID()))
        .andExpect(status().isUnauthorized());
  }

  private @NonNull UUID postTiedoteRequestAndReturnTiedoteId(TiedoteRequest tiedote)
      throws Exception {
    var response =
        performAuthorizedPostRequest(objectMapper.writeValueAsString(tiedote))
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

  private @NonNull ResultActions performAuthorizedPostRequest(String content) throws Exception {
    return mockMvc.perform(createAuthorizedPostRequest(content));
  }

  private @NonNull MockHttpServletRequestBuilder createAuthorizedPostRequest(String content) {
    return post("/api/v1/tiedote/kielitutkintotodistus")
        .with(validToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(content);
  }
}

record TiedoteRequest(String oppijanumero, String idempotencyKey) {}
