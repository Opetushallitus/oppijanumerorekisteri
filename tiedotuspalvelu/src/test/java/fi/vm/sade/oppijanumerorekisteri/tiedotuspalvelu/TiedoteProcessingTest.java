package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija.FetchOppijaTask;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SendSuomiFiViestitTask;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestiRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public class TiedoteProcessingTest extends TiedotuspalveluApiTest implements ResourceReader {

  @Autowired private FetchOppijaTask fetchOppijaTask;
  @Autowired private SendSuomiFiViestitTask sendSuomiFiViestitTask;

  @Autowired private SuomiFiViestiRepository suomiFiViestiRepository;

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  private static final String SUOMIFI_USERNAME = UUID.randomUUID().toString();
  private static final String SUOMIFI_PASSWORD = UUID.randomUUID().toString();
  private static final String SUOMIFI_SYSTEM_ID = UUID.randomUUID().toString();
  private static final String SUOMIFI_TOKEN = UUID.randomUUID().toString();
  private static final String OPPIJA_CLIENT_ID = UUID.randomUUID().toString();
  private static final String OPPIJA_CLIENT_SECRET = UUID.randomUUID().toString();
  private static final String OPPIJA_TOKEN = UUID.randomUUID().toString();
  private static final String SUOMIFI_MESSAGE_ID = UUID.randomUUID().toString();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("tiedotuspalvelu.suomifi-viestit.base-url", wireMock::baseUrl);
    registry.add("tiedotuspalvelu.suomifi-viestit.username", () -> SUOMIFI_USERNAME);
    registry.add("tiedotuspalvelu.suomifi-viestit.password", () -> SUOMIFI_PASSWORD);
    registry.add("tiedotuspalvelu.suomifi-viestit.sender-service-id", () -> SUOMIFI_SYSTEM_ID);
    registry.add("tiedotuspalvelu.oppijanumerorekisteri.base-url", wireMock::baseUrl);
    registry.add("tiedotuspalvelu.oauth2.token-url", () -> wireMock.baseUrl() + "/oauth2/token");
    registry.add("tiedotuspalvelu.oauth2.client-id", () -> OPPIJA_CLIENT_ID);
    registry.add("tiedotuspalvelu.oauth2.client-secret", () -> OPPIJA_CLIENT_SECRET);
  }

  @BeforeEach
  public void setup() {
    suomiFiViestiRepository.deleteAll();
    tiedoteRepository.deleteAll();
    wireMock.resetAll();
  }

  @Test
  public void sendsElectronicSuomiFiViesti() throws Exception {
    stubGettingOtuvaOauthToken();
    stubGettingOppija();
    stubGettingSuomiFiViestitToken();
    stubSendingSuomiFiElectronicMessage();

    var tiedote = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);

    fetchOppijaTask.execute();
    sendSuomiFiViestitTask.execute();

    var t = getTiedote(tiedote.getId());
    assertEquals("PROCESSED", t.meta().state());
    assertEquals("CREATED", t.statuses().get(0).status());
    assertEquals("SENT_TO_SUOMIFI_VIESTIT", t.statuses().get(1).status());
  }

  private void stubGettingOppija() {
    wireMock.stubFor(
        get(urlPathMatching("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES))
            .withHeader("Authorization", equalTo("Bearer " + OPPIJA_TOKEN))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        readResource("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + ".json"))));
  }

  private void stubSendingSuomiFiElectronicMessage() {
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"messageId\": \"%s\"}".formatted(SUOMIFI_MESSAGE_ID))));
  }

  private void stubGettingSuomiFiViestitToken() {
    wireMock.stubFor(
        post(urlEqualTo("/v1/token"))
            .withRequestBody(matchingJsonPath("$.username", equalTo(SUOMIFI_USERNAME)))
            .withRequestBody(matchingJsonPath("$.password", equalTo(SUOMIFI_PASSWORD)))
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
                            .formatted(SUOMIFI_TOKEN))));
  }

  private void stubGettingOtuvaOauthToken() {
    wireMock.stubFor(
        post(urlEqualTo("/oauth2/token"))
            .withRequestBody(
                equalTo(
                    "grant_type=client_credentials"
                        + "&client_id="
                        + OPPIJA_CLIENT_ID
                        + "&client_secret="
                        + OPPIJA_CLIENT_SECRET))
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
                            .formatted(OPPIJA_TOKEN))));
  }
}
