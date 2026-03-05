package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluApiTest;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public class FetchSuomiFiViestitEventsTaskTest extends TiedotuspalveluApiTest {

  @Autowired private FetchSuomiFiViestitEventsTask fetchSuomiFiViestitEventsTask;
  @Autowired private SuomiFiViestitEventRepository eventRepository;
  @Autowired private SuomiFiViestitEventsCursorRepository cursorRepository;

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  private static final String SUOMIFI_USERNAME = UUID.randomUUID().toString();
  private static final String SUOMIFI_PASSWORD = UUID.randomUUID().toString();
  private static final String SUOMIFI_SYSTEM_ID = UUID.randomUUID().toString();
  private static final String SUOMIFI_TOKEN = UUID.randomUUID().toString();
  private static final String MESSAGE_ID = UUID.randomUUID().toString();
  private static final String SERVICE_ID = UUID.randomUUID().toString();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("tiedotuspalvelu.suomifi-viestit.base-url", wireMock::baseUrl);
    registry.add("tiedotuspalvelu.suomifi-viestit.username", () -> SUOMIFI_USERNAME);
    registry.add("tiedotuspalvelu.suomifi-viestit.password", () -> SUOMIFI_PASSWORD);
    registry.add("tiedotuspalvelu.suomifi-viestit.sender-service-id", () -> SUOMIFI_SYSTEM_ID);
  }

  @BeforeEach
  public void setup() {
    eventRepository.deleteAll();
    cursorRepository.deleteAll();
    wireMock.resetAll();
  }

  @Test
  public void fetchesAndStoresEvents() {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        get(urlEqualTo("/v2/events"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                          "continuationToken": "token-1",
                          "events": [
                            {
                              "type": "Electronic message created",
                              "eventTime": "2026-02-27T10:00:00Z",
                              "metadata": {
                                "messageId": "%s",
                                "serviceId": "%s",
                                "externalId": "ext-1"
                              }
                            },
                            {
                              "type": "Electronic message read",
                              "eventTime": "2026-02-27T11:00:00Z",
                              "metadata": {
                                "messageId": "%s",
                                "serviceId": "%s"
                              }
                            }
                          ]
                        }
                        """
                            .formatted(MESSAGE_ID, SERVICE_ID, MESSAGE_ID, SERVICE_ID))));
    wireMock.stubFor(
        get(urlEqualTo("/v2/events?continuationToken=token-1"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                          "continuationToken": "token-2",
                          "events": []
                        }
                        """)));

    fetchSuomiFiViestitEventsTask.execute();

    var events = eventRepository.findAll();
    assertEquals(2, events.size());

    var created =
        events.stream()
            .filter(e -> e.getEventType().equals("Electronic message created"))
            .findFirst()
            .orElseThrow();
    assertEquals(MESSAGE_ID, created.getMessageId());
    assertNotNull(created.getMetadata());
    assertTrue(created.getMetadata().contains(SERVICE_ID));

    var read =
        events.stream()
            .filter(e -> e.getEventType().equals("Electronic message read"))
            .findFirst()
            .orElseThrow();
    assertEquals(MESSAGE_ID, read.getMessageId());

    var cursor = cursorRepository.findById(true).orElseThrow();
    assertEquals("token-2", cursor.getContinuationToken());
  }

  @Test
  public void resumesFromStoredCursor() {
    stubGettingSuomiFiViestitAccessToken();
    cursorRepository.save(new SuomiFiViestitEventsCursor(true, "existing-token"));

    wireMock.stubFor(
        get(urlEqualTo("/v2/events?continuationToken=existing-token"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                          "continuationToken": "new-token",
                          "events": [{
                            "type": "Electronic message read",
                            "eventTime": "2026-02-27T12:00:00Z",
                            "metadata": {"messageId": "%s", "serviceId": "%s"}
                          }]
                        }
                        """
                            .formatted(MESSAGE_ID, SERVICE_ID))));
    wireMock.stubFor(
        get(urlEqualTo("/v2/events?continuationToken=new-token"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {"continuationToken": "final-token", "events": []}
                        """)));

    fetchSuomiFiViestitEventsTask.execute();

    wireMock.verify(0, getRequestedFor(urlEqualTo("/v2/events")));
    wireMock.verify(1, getRequestedFor(urlEqualTo("/v2/events?continuationToken=existing-token")));

    assertEquals(1, eventRepository.findAll().size());
    assertEquals(
        "final-token", cursorRepository.findById(true).orElseThrow().getContinuationToken());
  }

  @Test
  public void handlesEmptyEventsGracefully() {
    stubGettingSuomiFiViestitAccessToken();
    wireMock.stubFor(
        get(urlEqualTo("/v2/events"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {"continuationToken": "initial-token", "events": []}
                        """)));

    fetchSuomiFiViestitEventsTask.execute();

    assertEquals(0, eventRepository.findAll().size());
    assertEquals(
        "initial-token", cursorRepository.findById(true).orElseThrow().getContinuationToken());
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
}
