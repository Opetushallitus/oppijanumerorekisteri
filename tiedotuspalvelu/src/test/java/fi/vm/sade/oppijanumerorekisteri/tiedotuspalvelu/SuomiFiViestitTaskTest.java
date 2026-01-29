package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.containing;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
public class SuomiFiViestitTaskTest {

  @Autowired private SuomiFiViestitTask suomiFiViestitTask;

  @Autowired private TiedoteRepository tiedoteRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  private static final String SUOMIFI_USERNAME = UUID.randomUUID().toString();
  private static final String SUOMIFI_PASSWORD = UUID.randomUUID().toString();
  private static final String SUOMIFI_SYSTEM_ID = UUID.randomUUID().toString();
  private static final String SUOMIFI_TOKEN = UUID.randomUUID().toString();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("tiedotuspalvelu.suomifi-viestit.base-url", wireMock::baseUrl);
    registry.add("tiedotuspalvelu.suomifi-viestit.username", () -> SUOMIFI_USERNAME);
    registry.add("tiedotuspalvelu.suomifi-viestit.password", () -> SUOMIFI_PASSWORD);
    registry.add("tiedotuspalvelu.suomifi-viestit.sender-service-id", () -> SUOMIFI_SYSTEM_ID);
    registry.add("tiedotuspalvelu.oppijanumerorekisteri.base-url", wireMock::baseUrl);
  }

  @BeforeEach
  public void setup() {
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

    var tiedote =
        tiedoteRepository.save(
            Tiedote.builder()
                .oppijanumero("1.2.246.562.24.00000000001")
                .url("https://a.example")
                .suomiFiViestiSent(false)
                .build());

    suomiFiViestitTask.execute();

    wireMock.verify(
        postRequestedFor(urlEqualTo("/v2/messages/electronic"))
            .withHeader("Authorization", equalTo("Bearer " + SUOMIFI_TOKEN))
            .withRequestBody(matchingJsonPath("$.externalId", equalTo(tiedote.getId().toString())))
            .withRequestBody(matchingJsonPath("$.recipient.id", equalTo("010170-9999")))
            .withRequestBody(matchingJsonPath("$.sender.serviceId", equalTo(SUOMIFI_SYSTEM_ID)))
            .withRequestBody(
                matchingJsonPath("$.electronic.body", containing("https://a.example"))));
    wireMock.verify(1, postRequestedFor(urlEqualTo("/v2/messages/electronic")));
    wireMock.verify(1, postRequestedFor(urlEqualTo("/v1/token")));

    assertTrue(tiedoteRepository.findById(tiedote.getId()).orElseThrow().isSuomiFiViestiSent());
  }
}
