package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

public class ApiControllerTest extends TiedotuspalveluApiTest {

  private static final String OPPIJANUMERO = OidGenerator.generateHenkiloOid();
  private static final String OPISKELUOIKEUS_OID = OidGenerator.generateOpiskeluoikeusOid();

  @Test
  public void createTiedoteRequiresAuthentication() throws Exception {
    mockMvc
        .perform(
            post("/omat-viestit/api/v1/tiedote/kielitutkintotodistus")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void createTiedoteFailsWithoutRequiredRole() throws Exception {
    mockMvc
        .perform(
            post("/omat-viestit/api/v1/tiedote/kielitutkintotodistus")
                .with(tokenFor(OIKEUDETON))
                .contentType(MediaType.APPLICATION_JSON)
                .content(tiedoteJson(UUID.randomUUID().toString())))
        .andExpect(status().isForbidden());
  }

  @Test
  public void createTiedoteSucceedsWithValidData() throws Exception {
    clearDatabase();
    String idempotencyKey = UUID.randomUUID().toString();
    var returnedId = postTiedoteAndReturnId(tiedoteJson(idempotencyKey));

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(1, tiedotteet.size());
    Tiedote saved = tiedotteet.stream().filter(t -> t.getId().equals(returnedId)).findFirst().get();
    assertEquals(saved.getId(), returnedId);
    assertEquals(OPPIJANUMERO, saved.getOppijanumero());
    assertEquals(idempotencyKey, saved.getIdempotencyKey());

    mockMvc
        .perform(
            get("/omat-viestit/api/v1/tiedote/" + returnedId)
                .with(tokenFor(KIELITUTKINNOSTA_TIEDOTTAJA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(returnedId.toString()))
        .andExpect(jsonPath("$.opiskeluoikeusOid").value(OPISKELUOIKEUS_OID))
        .andExpect(jsonPath("$.meta.type").value("KIELITUTKINTOTODISTUS"))
        .andExpect(jsonPath("$.meta.state").value("OPPIJAN_VALIDOINTI"))
        .andExpect(jsonPath("$.statuses[0].status").value("CREATED"))
        .andExpect(jsonPath("$.statuses[0].timestamp").exists());
  }

  @Test
  public void createTiedoteSucceedsWithoutOpiskeluoikeusOid() throws Exception {
    var body =
        """
        {
          "oppijanumero": "%s",
          "idempotencyKey": "%s"
        }
        """
            .formatted(OPPIJANUMERO, UUID.randomUUID().toString());
    performAuthorizedPostRequest(body).andExpect(status().isOk());
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
    clearDatabase();
    String idempotencyKey = UUID.randomUUID().toString();
    var json = tiedoteJson(idempotencyKey);
    var firstId = postTiedoteAndReturnId(json);
    var secondId = postTiedoteAndReturnId(json);

    assertEquals(firstId, secondId);

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(1, tiedotteet.size());
    assertEquals(idempotencyKey, tiedotteet.get(0).getIdempotencyKey());
  }

  @Test
  public void createTiedoteWithDifferentIdempotencyKeysCreatesDifferentRecords() throws Exception {
    clearDatabase();

    var firstId = postTiedoteAndReturnId(tiedoteJson(UUID.randomUUID().toString()));
    var secondId = postTiedoteAndReturnId(tiedoteJson(UUID.randomUUID().toString()));

    assertEquals(false, firstId.equals(secondId));

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(2, tiedotteet.size());
  }

  @Test
  public void getTiedoteReturns404ForUnknownId() throws Exception {
    mockMvc
        .perform(
            get("/omat-viestit/api/v1/tiedote/" + UUID.randomUUID())
                .with(tokenFor(KIELITUTKINNOSTA_TIEDOTTAJA)))
        .andExpect(status().isNotFound());
  }

  @Test
  public void getTiedoteRequiresAuthentication() throws Exception {
    mockMvc
        .perform(get("/omat-viestit/api/v1/tiedote/" + UUID.randomUUID()))
        .andExpect(status().isUnauthorized());
  }

  private @NonNull UUID postTiedoteAndReturnId(String json) throws Exception {
    var response =
        performAuthorizedPostRequest(json)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    return UUID.fromString(objectMapper.readTree(response).get("id").asText());
  }

  private String tiedoteJson(String idempotencyKey) {
    return """
        {
          "oppijanumero": "%s",
          "opiskeluoikeusOid": "%s",
          "idempotencyKey": "%s"
        }
        """
        .formatted(OPPIJANUMERO, OPISKELUOIKEUS_OID, idempotencyKey);
  }

  private @NonNull ResultActions performAuthorizedPostRequest(String content) throws Exception {
    return mockMvc.perform(createAuthorizedPostRequest(content));
  }

  private @NonNull MockHttpServletRequestBuilder createAuthorizedPostRequest(String content) {
    return post("/omat-viestit/api/v1/tiedote/kielitutkintotodistus")
        .with(tokenFor(KIELITUTKINNOSTA_TIEDOTTAJA))
        .contentType(MediaType.APPLICATION_JSON)
        .content(content);
  }
}
