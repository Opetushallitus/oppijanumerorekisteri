package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.ResourceReader;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluApiTest;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.function.Consumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public class SendSuomiFiViestitTaskTest extends TiedotuspalveluApiTest implements ResourceReader {

  @Autowired private SendSuomiFiViestitTask sendSuomiFiViestitTask;

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
    clearDatabase();
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
    var tiedote = createTiedoteAndRunTask();

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
  public void respectsNextRetryTimeInFuture() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withBody("{\"messageId\": \"%s\"}".formatted(SUOMIFI_MESSAGE_ID))));

    var tiedote =
        createTiedoteAndRunTask(
            t -> {
              t.setRetryCount(1);
              t.setNextRetry(OffsetDateTime.now().plusHours(1));
            });

    assertEquals(1, tiedote.getRetryCount());
    assertThat(tiedote.getNextRetry()).isAfter(OffsetDateTime.now());
    assertThat(tiedote.getViesti().getProcessedAt()).isNull();
  }

  @Test
  public void respectsNextRetryTimeInPast() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withBody("{\"messageId\": \"%s\"}".formatted(SUOMIFI_MESSAGE_ID))));

    var tiedote =
        createTiedoteAndRunTask(
            t -> {
              t.setRetryCount(1);
              t.setNextRetry(OffsetDateTime.now().minusDays(10));
            });

    assertEquals(0, tiedote.getRetryCount());
    assertThat(tiedote.getNextRetry()).isNull();
    assertThat(tiedote.getViesti().getProcessedAt()).isNotNull();
  }

  @Test
  public void handlesSuomiFiFailure() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic")).willReturn(aResponse().withStatus(500)));

    var updatedTiedote = createTiedoteAndRunTask();
    assertNull(updatedTiedote.getViesti().getProcessedAt());
    assertNull(updatedTiedote.getViesti().getMessageId());
    assertEquals(1, updatedTiedote.getRetryCount());
    assertNotNull(updatedTiedote.getNextRetry());
  }

  private Tiedote createTiedoteAndRunTask() throws Exception {
    return createTiedoteAndRunTask(t -> {});
  }

  private Tiedote createTiedoteAndRunTask(Consumer<Tiedote> modify) throws Exception {
    var tiedote = createTiedote("1.2.3");
    tiedote.setState(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS);
    tiedote.setViesti(getSuomiFiViestiBuilder(tiedote).build());
    modify.accept(tiedote);
    tiedote = tiedoteRepository.save(tiedote);

    sendSuomiFiViestitTask.execute();

    return tiedoteRepository.findById(tiedote.getId()).orElseThrow();
  }

  @Test
  public void switchesToKielitutkintotodistuksenNoutoForPaperMailingOnMailboxNotInUse()
      throws Exception {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        post(urlEqualTo("/v2/messages/electronic"))
            .willReturn(
                aResponse()
                    .withStatus(400)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"errorCode\": \"MAILBOX_NOT_IN_USE\"}")));

    var tiedote = createTiedoteAndRunTask();

    sendSuomiFiViestitTask.execute();

    var updatedTiedote = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertEquals("paperMail", updatedTiedote.getViesti().getMessageType());
    assertNull(updatedTiedote.getViesti().getProcessedAt());
    assertNull(updatedTiedote.getNextRetry());
    assertEquals(0, updatedTiedote.getRetryCount());
    assertThat(updatedTiedote.getState()).isEqualTo(Tiedote.STATE_KIELITUTKINTOTODISTUKSEN_NOUTO);
  }

  @Test
  public void sendsPaperMailMessage() throws Exception {
    stubGettingSuomiFiViestitAccessToken();
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

    var updatedTiedote =
        createTiedoteAndRunTask(
            t -> {
              t.setState(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA);
              t.setTodistusBucketName("bucketName");
              t.setTodistusObjectKey("objectKey");
              t.setKielitutkintotodistusPdf(
                  KielitutkintotodistusPdf.builder()
                      .tiedote(t)
                      .content(readBytes("/fakekielitutkintotodistus.pdf"))
                      .build());
              t.getViesti().setMessageType("paperMail");
            });

    assertEquals("paperMail", updatedTiedote.getViesti().getMessageType());
    assertNotNull(updatedTiedote.getViesti().getProcessedAt());
    assertEquals("msg-456", updatedTiedote.getViesti().getMessageId());
    assertEquals(0, updatedTiedote.getRetryCount());
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
