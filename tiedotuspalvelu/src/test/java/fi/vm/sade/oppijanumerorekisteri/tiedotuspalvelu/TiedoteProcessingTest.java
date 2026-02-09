package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
public class TiedoteProcessingTest {

  @Autowired private FetchOppijaTask fetchOppijaTask;
  @Autowired private SendSuomiFiViestitTask sendSuomiFiViestitTask;

  @Autowired private TiedoteRepository tiedoteRepository;
  @Autowired private SuomiFiViestiRepository suomiFiViestiRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  private Tiedote createTiedote(String oppijanumero) {
    return Tiedote.builder()
        .oppijanumero(oppijanumero)
        .idempotencyKey(UUID.randomUUID().toString())
        .processedAt(null)
        .build();
  }

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  private static final String SUOMIFI_USERNAME = UUID.randomUUID().toString();
  private static final String SUOMIFI_PASSWORD = UUID.randomUUID().toString();
  private static final String SUOMIFI_SYSTEM_ID = UUID.randomUUID().toString();
  private static final String SUOMIFI_TOKEN = UUID.randomUUID().toString();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("tiedotuspalvelu.suomifi-viestit.enabled", () -> "true");
    registry.add("tiedotuspalvelu.fetch-oppija.enabled", () -> "true");
    registry.add("tiedotuspalvelu.suomifi-viestit.base-url", wireMock::baseUrl);
    registry.add("tiedotuspalvelu.suomifi-viestit.username", () -> SUOMIFI_USERNAME);
    registry.add("tiedotuspalvelu.suomifi-viestit.password", () -> SUOMIFI_PASSWORD);
    registry.add("tiedotuspalvelu.suomifi-viestit.sender-service-id", () -> SUOMIFI_SYSTEM_ID);
    registry.add("tiedotuspalvelu.oppijanumerorekisteri.base-url", wireMock::baseUrl);
  }

  @BeforeEach
  public void setup() {
    suomiFiViestiRepository.deleteAll();
    tiedoteRepository.deleteAll();
    wireMock.resetAll();
  }

  @Test
  public void processesTiedote() {
    wireMock.stubFor(
        get(urlPathMatching("/henkilo/.*"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                          "oid": "1.2.246.562.98.00000000001",
                          "henkilotunnus": "010170-9999"
                        }
                        """)));
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
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"messageId\": 123}")));

    var tiedote = tiedoteRepository.save(createTiedote("1.2.246.562.24.00000000001"));

    fetchOppijaTask.execute();
    sendSuomiFiViestitTask.execute();

    wireMock.verify(
        postRequestedFor(urlEqualTo("/v2/messages/electronic"))
            .withHeader("Authorization", equalTo("Bearer " + SUOMIFI_TOKEN))
            .withRequestBody(matchingJsonPath("$.externalId", equalTo(tiedote.getId().toString())))
            .withRequestBody(matchingJsonPath("$.recipient.id", equalTo("010170-9999")))
            .withRequestBody(matchingJsonPath("$.sender.serviceId", equalTo(SUOMIFI_SYSTEM_ID))));
    wireMock.verify(1, postRequestedFor(urlEqualTo("/v2/messages/electronic")));
    wireMock.verify(1, postRequestedFor(urlEqualTo("/v1/token")));

    assertNotNull(tiedoteRepository.findById(tiedote.getId()).orElseThrow().getProcessedAt());
  }
}
