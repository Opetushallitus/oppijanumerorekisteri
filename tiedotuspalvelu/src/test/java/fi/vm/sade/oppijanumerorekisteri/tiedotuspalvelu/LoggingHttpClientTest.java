package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static com.github.tomakehurst.wiremock.http.Fault.CONNECTION_RESET_BY_PEER;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.slf4j.LoggerFactory;

public class LoggingHttpClientTest {

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  @BeforeEach
  public void setup() {
    wireMock.resetAll();
  }

  @Test
  public void logsJsonForSuccessfulResponse() throws Exception {
    var objectMapper = new ObjectMapper();
    var logger = (Logger) LoggerFactory.getLogger(LoggingHttpClient.class);
    var listAppender = new ListAppender<ILoggingEvent>();
    listAppender.start();
    var originalLevel = logger.getLevel();
    logger.setLevel(Level.INFO);
    logger.addAppender(listAppender);
    try {
      var testPath = "/" + UUID.randomUUID();
      var testClientName = UUID.randomUUID().toString();
      wireMock.stubFor(
          get(urlEqualTo(testPath)).willReturn(aResponse().withStatus(200).withBody("ok")));

      var httpClient = new LoggingHttpClient(testClientName);
      var request =
          HttpRequest.newBuilder().uri(URI.create(wireMock.baseUrl() + testPath)).GET().build();

      httpClient.send(request, HttpResponse.BodyHandlers.discarding());

      var message = singleLogMessage(listAppender);
      var json = objectMapper.readTree(message);
      assertEquals(testClientName, json.get("client").asText());
      assertEquals(wireMock.baseUrl() + testPath, json.get("url").asText());
      assertEquals(200, json.get("httpCode").asInt());
      assertTrue(json.get("duration").asLong() >= 0);
      assertNotNull(Instant.parse(json.get("timestamp").asText()));
    } finally {
      logger.detachAppender(listAppender);
      logger.setLevel(originalLevel);
    }
  }

  @Test
  public void logsJsonWhenSendThrows() throws Exception {
    var objectMapper = new ObjectMapper();
    var logger = (Logger) LoggerFactory.getLogger(LoggingHttpClient.class);
    var listAppender = new ListAppender<ILoggingEvent>();
    listAppender.start();
    var originalLevel = logger.getLevel();
    logger.setLevel(Level.INFO);
    logger.addAppender(listAppender);
    try {
      var testClientName = UUID.randomUUID().toString();
      var testUrl = "/" + UUID.randomUUID();
      wireMock.stubFor(
          get(urlEqualTo(testUrl)).willReturn(aResponse().withFault(CONNECTION_RESET_BY_PEER)));

      var httpClient = new LoggingHttpClient(testClientName);
      var request =
          HttpRequest.newBuilder().uri(URI.create(wireMock.baseUrl() + testUrl)).GET().build();

      assertThrows(
          IOException.class,
          () -> httpClient.send(request, HttpResponse.BodyHandlers.discarding()));

      var message = singleLogMessage(listAppender);
      var json = objectMapper.readTree(message);
      assertEquals(-1, json.get("httpCode").asInt());
    } finally {
      logger.detachAppender(listAppender);
      logger.setLevel(originalLevel);
    }
  }

  private static String singleLogMessage(ListAppender<ILoggingEvent> appender) {
    assertEquals(1, appender.list.size());
    return appender.list.get(0).getFormattedMessage();
  }
}
