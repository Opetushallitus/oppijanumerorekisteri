package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija.FetchOppijaTask;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestiRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public class FetchOppijaTaskTest extends TiedotuspalveluApiTest implements ResourceReader {

  @Autowired private FetchOppijaTask fetchOppijaTask;
  @Autowired private SuomiFiViestiRepository suomiFiViestiRepository;

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  private static final String OPP_CLIENT_ID = UUID.randomUUID().toString();
  private static final String OPP_CLIENT_SECRET = UUID.randomUUID().toString();
  private static final String OPP_TOKEN = UUID.randomUUID().toString();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("tiedotuspalvelu.oppijanumerorekisteri.base-url", wireMock::baseUrl);
    registry.add("tiedotuspalvelu.oauth2.token-url", () -> wireMock.baseUrl() + "/oauth2/token");
    registry.add("tiedotuspalvelu.oauth2.client-id", () -> OPP_CLIENT_ID);
    registry.add("tiedotuspalvelu.oauth2.client-secret", () -> OPP_CLIENT_SECRET);
  }

  @BeforeEach
  public void setup() {
    suomiFiViestiRepository.deleteAll();
    tiedoteRepository.deleteAll();
    wireMock.resetAll();
  }

  @Test
  public void respectsNextRetryTime() throws Exception {
    wireMock.stubFor(
        post(urlEqualTo("/oauth2/token"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                          "access_token": "%s",
                          "expires_in": 3600,
                          "token_type": "Bearer"
                        }
                        """
                            .formatted(OPP_TOKEN))));
    wireMock.stubFor(
        get(urlPathMatching("/henkilo/.*"))
            .withHeader("Authorization", equalTo("Bearer " + OPP_TOKEN))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        readResource("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + ".json"))));

    var futureTiedote = createTiedote("1.2.246.562.24.00000000001");
    futureTiedote.setNextRetry(java.time.OffsetDateTime.now().plusHours(1));
    futureTiedote.setRetryCount(1);
    tiedoteRepository.save(futureTiedote);

    var pastTiedote = createTiedote("1.2.246.562.24.00000000002");
    pastTiedote.setNextRetry(java.time.OffsetDateTime.now().minusMinutes(1));
    pastTiedote.setRetryCount(1);
    tiedoteRepository.save(pastTiedote);

    fetchOppijaTask.execute();

    var futureTiedoteUpdated = tiedoteRepository.findById(futureTiedote.getId()).orElseThrow();
    assertNull(futureTiedoteUpdated.getProcessedAt());
    assertEquals(1, futureTiedoteUpdated.getRetryCount());

    var pastTiedoteUpdated = tiedoteRepository.findById(pastTiedote.getId()).orElseThrow();
    assertNotNull(pastTiedoteUpdated.getProcessedAt());
  }

  @Test
  public void setsStateToSuomiFiViestiHetulliselle() throws Exception {
    stubOauthToken();
    wireMock.stubFor(
        get(urlPathMatching("/henkilo/.*"))
            .withHeader("Authorization", equalTo("Bearer " + OPP_TOKEN))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        readResource("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + ".json"))));

    var tiedote = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);
    assertEquals(ApiController.Meta.STATE_NEW, tiedote.getTiedotestateId());

    fetchOppijaTask.execute();

    var updated = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertEquals(ApiController.Meta.STATE_SUOMIFI_VIESTI_HETULLISELLE, updated.getTiedotestateId());
  }

  @Test
  public void handlesOppijanumerorekisteriFailure() throws Exception {
    wireMock.stubFor(
        post(urlEqualTo("/oauth2/token"))
            .withRequestBody(
                equalTo(
                    "grant_type=client_credentials"
                        + "&client_id="
                        + OPP_CLIENT_ID
                        + "&client_secret="
                        + OPP_CLIENT_SECRET))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                          "access_token": "%s",
                          "expires_in": 3600,
                          "token_type": "Bearer"
                        }
                        """
                            .formatted(OPP_TOKEN))));
    wireMock.stubFor(
        get(urlPathMatching("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES))
            .withHeader("Authorization", equalTo("Bearer " + OPP_TOKEN))
            .willReturn(aResponse().withStatus(500)));

    var tiedote = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);

    fetchOppijaTask.execute();

    var updatedTiedote = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertNull(updatedTiedote.getProcessedAt());
    assertEquals(1, updatedTiedote.getRetryCount());
    assertNotNull(updatedTiedote.getNextRetry());
  }

  @Test
  public void handlesMissingOppijaAddressData() throws Exception {
    wireMock.stubFor(
        post(urlEqualTo("/oauth2/token"))
            .withRequestBody(
                equalTo(
                    "grant_type=client_credentials"
                        + "&client_id="
                        + OPP_CLIENT_ID
                        + "&client_secret="
                        + OPP_CLIENT_SECRET))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                                            {
                                              "access_token": "%s",
                                              "expires_in": 3600,
                                              "token_type": "Bearer"
                                            }
                                            """
                            .formatted(OPP_TOKEN))));
    wireMock.stubFor(
        get(urlPathMatching("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES))
            .withHeader("Authorization", equalTo("Bearer " + OPP_TOKEN))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withBody(
                        readResource(
                            "/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + "-no-address.json"))));

    var tiedote = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);

    fetchOppijaTask.execute();

    var updatedTiedote = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertNull(updatedTiedote.getProcessedAt());
    assertEquals(1, updatedTiedote.getRetryCount());
    assertNotNull(updatedTiedote.getNextRetry());
  }

  private void stubOauthToken() {
    wireMock.stubFor(
        post(urlEqualTo("/oauth2/token"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                          "access_token": "%s",
                          "expires_in": 3600,
                          "token_type": "Bearer"
                        }
                        """
                            .formatted(OPP_TOKEN))));
  }
}
