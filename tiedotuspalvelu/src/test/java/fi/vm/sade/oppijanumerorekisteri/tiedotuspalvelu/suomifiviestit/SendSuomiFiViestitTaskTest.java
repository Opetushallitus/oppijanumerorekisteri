package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.ApiController;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluApiTest;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public class SendSuomiFiViestitTaskTest extends TiedotuspalveluApiTest {

  @Autowired private SendSuomiFiViestitTask sendSuomiFiViestitTask;
  @Autowired private SuomiFiViestiRepository suomiFiViestiRepository;

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  private static final String SUOMIFI_USERNAME = UUID.randomUUID().toString();
  private static final String SUOMIFI_PASSWORD = UUID.randomUUID().toString();
  private static final String SUOMIFI_SYSTEM_ID = UUID.randomUUID().toString();
  private static final String SUOMIFI_TOKEN = UUID.randomUUID().toString();
  private static final String SUOMIFI_MESSAGE_ID = UUID.randomUUID().toString();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
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
  public void sendsTheExpectedElectronicMessageToSuomiFiViestit() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withBody("{\"messageId\": \"%s\"}".formatted(SUOMIFI_MESSAGE_ID))));
    var tiedote = createTiedote("1.2.3");
    suomiFiViestiRepository.save(getSuomiFiViestiBuilder(tiedote).build());

    sendSuomiFiViestitTask.execute();

    wireMock.verify(
        postRequestedFor(urlEqualTo("/v2/messages/electronic"))
            .withHeader("Authorization", equalTo("Bearer " + SUOMIFI_TOKEN))
            .withRequestBody(matchingJsonPath("$.externalId", equalTo(tiedote.getId().toString())))
            .withRequestBody(matchingJsonPath("$.recipient.id", equalTo("010170-9998")))
            .withRequestBody(matchingJsonPath("$.sender.serviceId", equalTo(SUOMIFI_SYSTEM_ID)))
            .withRequestBody(
                matchingJsonPath(
                    "$.electronic.title", equalTo("Sinulle on uusi viesti Oma Opintopolussa")))
            .withRequestBody(
                matchingJsonPath(
                    "$.electronic.body",
                    equalTo(
                        "Hei!\n\nSinulle on saapunut uusi viesti Oma Opintopolku-palvelussa. \n\nVoit lukea viestin kirjautumalla Oma Opintopolku-palveluun. Kun olet kirjautunut sisään, voit lukea viestisi Viestini-sivulta.\n\nTietoturvasyistä tässä viestissä ei ole suoraa linkkiä palveluun. \n\nYstävällisin terveisin,\nOpetushallitus"))));
  }

  @Test
  public void respectsNextRetryTime() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withBody("{\"messageId\": \"%s\"}".formatted(SUOMIFI_MESSAGE_ID))));

    var tiedote = createTiedote("1.2.3");

    var futureViesti =
        suomiFiViestiRepository.save(
            getSuomiFiViestiBuilder(tiedote)
                .nextRetry(OffsetDateTime.now().plusHours(1))
                .retryCount(1)
                .build());

    var pastViesti =
        suomiFiViestiRepository.save(
            getSuomiFiViestiBuilder(tiedote)
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
    assertEquals(SUOMIFI_MESSAGE_ID, pastViestiUpdated.getMessageId());

    var updatedTiedote = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertEquals(ApiController.Meta.STATE_PROCESSED, updatedTiedote.getTiedotestateId());
  }

  @Test
  public void handlesSuomiFiFailure() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic")).willReturn(aResponse().withStatus(500)));

    var tiedote = createTiedote("1.2.3");
    var viesti = suomiFiViestiRepository.save(getSuomiFiViestiBuilder(tiedote).build());

    sendSuomiFiViestitTask.execute();

    var updatedViesti = suomiFiViestiRepository.findById(viesti.getId()).orElseThrow();
    assertNull(updatedViesti.getProcessedAt());
    assertNull(updatedViesti.getMessageId());
    assertEquals(1, updatedViesti.getRetryCount());
    assertNotNull(updatedViesti.getNextRetry());
  }

  @Test
  public void switchesToPaperMailOnMailboxNotInUse() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(400)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"errorCode\": \"MAILBOX_NOT_IN_USE\"}")));

    var tiedote = createTiedote("1.2.3");
    var viesti = suomiFiViestiRepository.save(getSuomiFiViestiBuilder(tiedote).build());

    sendSuomiFiViestitTask.execute();

    var updatedViesti = suomiFiViestiRepository.findById(viesti.getId()).orElseThrow();
    assertEquals("paperMail", updatedViesti.getMessageType());
    assertNull(updatedViesti.getProcessedAt());
    assertNull(updatedViesti.getNextRetry());
    assertEquals(0, updatedViesti.getRetryCount());
    var updatedTiedote = getTiedote(tiedote.getId());
    assertThat(updatedTiedote.meta().state())
        .isEqualTo(ApiController.Meta.STATE_PAPERIPOSTI_HETULLISELLE);
  }

  @Test
  public void sendsPaperMailMessage() throws Exception {
    byte[] PDF_MAGIC_BYTES = {0x25, 0x50, 0x44, 0x46};
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        get(urlEqualTo("/todistus.pdf"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/pdf")
                    .withBody(PDF_MAGIC_BYTES)));
    wireMock.stubFor(
        post(urlEqualTo("/v2/attachments"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"attachmentId\": \"attach-123\"}")));
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"messageId\": \"msg-456\"}")));

    var tiedote = createTiedote("1.2.3");
    tiedote.setTodistusUrl(wireMock.baseUrl() + "/todistus.pdf");
    tiedoteRepository.save(tiedote);
    var viesti =
        suomiFiViestiRepository.save(
            getSuomiFiViestiBuilder(tiedote).messageType("paperMail").build());

    sendSuomiFiViestitTask.execute();

    var updatedViesti = suomiFiViestiRepository.findById(viesti.getId()).orElseThrow();
    assertEquals("paperMail", updatedViesti.getMessageType());
    assertNotNull(updatedViesti.getProcessedAt());
    assertEquals("msg-456", updatedViesti.getMessageId());
    assertEquals(0, updatedViesti.getRetryCount());
  }

  private void stubGettingSuomiFiViestitAccessToken() {
    wireMock.stubFor(
        post(urlEqualTo("/v1/token"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        "{\"access_token\": \"%s\", \"expires_in\": 3600}"
                            .formatted(SUOMIFI_TOKEN))));
  }

  private SuomiFiViesti.SuomiFiViestiBuilder getSuomiFiViestiBuilder(Tiedote tiedote) {
    return SuomiFiViesti.builder()
        .tiedote(tiedote)
        .henkilotunnus("010170-9998")
        .name("Katti Purr")
        .streetAddress("Kissatie 2")
        .zipCode("00200")
        .city("Espoo")
        .countryCode("FI")
        .messageType("electronic");
  }
}
