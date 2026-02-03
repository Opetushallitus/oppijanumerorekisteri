package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
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
public class FetchOppijaTaskTest {

  @Autowired private FetchOppijaTask fetchOppijaTask;
  @Autowired private TiedoteRepository tiedoteRepository;
  @Autowired private SuomiFiViestiRepository suomiFiViestiRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  private Tiedote createTiedote(String oppijanumero) {
    return Tiedote.builder()
        .oppijanumero(oppijanumero)
        .titleFi("Title FI")
        .titleSv("Title SV")
        .titleEn("Title EN")
        .messageFi("Message FI")
        .messageSv("Message SV")
        .messageEn("Message EN")
        .idempotencyKey(java.util.UUID.randomUUID().toString())
        .processedAt(null)
        .build();
  }

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("tiedotuspalvelu.oppijanumerorekisteri.base-url", wireMock::baseUrl);
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

    var futureTiedote =
        tiedoteRepository.save(
            createTiedote("1.2.246.562.24.00000000001").toBuilder()
                .nextRetry(java.time.OffsetDateTime.now().plusHours(1))
                .retryCount(1)
                .build());

    var pastTiedote =
        tiedoteRepository.save(
            createTiedote("1.2.246.562.24.00000000002").toBuilder()
                .nextRetry(java.time.OffsetDateTime.now().minusMinutes(1))
                .retryCount(1)
                .build());

    fetchOppijaTask.execute();

    var futureTiedoteUpdated = tiedoteRepository.findById(futureTiedote.getId()).orElseThrow();
    assertNull(futureTiedoteUpdated.getProcessedAt());
    assertEquals(1, futureTiedoteUpdated.getRetryCount());

    var pastTiedoteUpdated = tiedoteRepository.findById(pastTiedote.getId()).orElseThrow();
    assertNotNull(pastTiedoteUpdated.getProcessedAt());
  }

  @Test
  public void handlesOppijanumerorekisteriFailure() {
    wireMock.stubFor(get(urlPathMatching("/henkilo/.*")).willReturn(aResponse().withStatus(500)));

    var tiedote = tiedoteRepository.save(createTiedote("1.2.246.562.24.00000000001"));

    fetchOppijaTask.execute();

    var updatedTiedote = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertNull(updatedTiedote.getProcessedAt());
    assertEquals(1, updatedTiedote.getRetryCount());
    assertNotNull(updatedTiedote.getNextRetry());
  }
}
