package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import java.time.OffsetDateTime;
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
public class SendSuomiFiViestitTaskTest {

  @Autowired private SendSuomiFiViestitTask sendSuomiFiViestitTask;
  @Autowired private TiedoteRepository tiedoteRepository;
  @Autowired private SuomiFiViestiRepository suomiFiViestiRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  private Tiedote createTiedote(String oppijanumero) {
    return Tiedote.builder()
        .oppijanumero(oppijanumero)
        .idempotencyKey(UUID.randomUUID().toString())
        .todistusUrl("https://example.com/todistus")
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
    registry.add("tiedotuspalvelu.suomifi-viestit.base-url", wireMock::baseUrl);
    registry.add("tiedotuspalvelu.suomifi-viestit.username", () -> SUOMIFI_USERNAME);
    registry.add("tiedotuspalvelu.suomifi-viestit.password", () -> SUOMIFI_PASSWORD);
    registry.add("tiedotuspalvelu.suomifi-viestit.sender-service-id", () -> SUOMIFI_SYSTEM_ID);
  }

  @BeforeEach
  public void setup() {
    suomiFiViestiRepository.deleteAll();
    tiedoteRepository.deleteAll();
    wireMock.resetAll();
  }

  @Test
  public void respectsNextRetryTime() {
    wireMock.stubFor(
        post(urlEqualTo("/v1/token"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        "{\"access_token\": \"%s\", \"expires_in\": 3600}"
                            .formatted(SUOMIFI_TOKEN))));
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(aResponse().withStatus(200).withBody("{\"messageId\": 123}")));

    var tiedote = tiedoteRepository.save(createTiedote("1.2.3"));

    var futureViesti =
        suomiFiViestiRepository.save(
            SuomiFiViesti.builder()
                .tiedoteId(tiedote.getId())
                .henkilotunnus("010170-9999")
                .name("Kissa Minou")
                .streetAddress("Kissankuja 1")
                .zipCode("00100")
                .city("Helsinki")
                .countryCode("FI")
                .nextRetry(OffsetDateTime.now().plusHours(1))
                .retryCount(1)
                .build());

    var pastViesti =
        suomiFiViestiRepository.save(
            SuomiFiViesti.builder()
                .tiedoteId(tiedote.getId())
                .henkilotunnus("010170-9998")
                .name("Katti Purr")
                .streetAddress("Kissatie 2")
                .zipCode("00200")
                .city("Espoo")
                .countryCode("FI")
                .nextRetry(OffsetDateTime.now().minusMinutes(1))
                .retryCount(1)
                .build());

    sendSuomiFiViestitTask.execute();

    var futureViestiUpdated = suomiFiViestiRepository.findById(futureViesti.getId()).orElseThrow();
    assertNull(futureViestiUpdated.getProcessedAt());
    assertEquals(1, futureViestiUpdated.getRetryCount());

    var pastViestiUpdated = suomiFiViestiRepository.findById(pastViesti.getId()).orElseThrow();
    assertNotNull(pastViestiUpdated.getProcessedAt());
    assertEquals(0, pastViestiUpdated.getRetryCount());
  }

  @Test
  public void handlesSuomiFiFailure() {
    wireMock.stubFor(
        post(urlEqualTo("/v1/token"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        "{\"access_token\": \"%s\", \"expires_in\": 3600}"
                            .formatted(SUOMIFI_TOKEN))));
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic")).willReturn(aResponse().withStatus(500)));

    var tiedote = tiedoteRepository.save(createTiedote("1.2.3"));
    var viesti =
        suomiFiViestiRepository.save(
            SuomiFiViesti.builder()
                .tiedoteId(tiedote.getId())
                .henkilotunnus("010170-9999")
                .name("Mirri Meow")
                .streetAddress("Kissankatu 3")
                .zipCode("00300")
                .city("Vantaa")
                .countryCode("FI")
                .build());

    sendSuomiFiViestitTask.execute();

    var updatedViesti = suomiFiViestiRepository.findById(viesti.getId()).orElseThrow();
    assertNull(updatedViesti.getProcessedAt());
    assertEquals(1, updatedViesti.getRetryCount());
    assertNotNull(updatedViesti.getNextRetry());
  }
}
