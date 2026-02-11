package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class LoggingHttpClient {

  private final String clientName;
  private final ObjectMapper objectMapper;
  private final HttpClient delegate;

  public LoggingHttpClient(String clientName) {
    this.clientName = clientName;
    this.objectMapper = new ObjectMapper();
    this.delegate = HttpClient.newHttpClient();
  }

  public <T> HttpResponse<T> send(HttpRequest request, HttpResponse.BodyHandler<T> bodyHandler)
      throws IOException, InterruptedException {
    var requestTimestamp = Instant.now().toString();
    var startNanos = System.nanoTime();
    int statusCode = -1;
    try {
      var response = delegate.send(request, bodyHandler);
      statusCode = response.statusCode();
      return response;
    } finally {
      var durationMs = Duration.ofNanos(System.nanoTime() - startNanos).toMillis();
      var logEntry =
          new OutgoingRequestLog(
              clientName, request.uri().toString(), statusCode, durationMs, requestTimestamp);
      log.info(toJson(logEntry));
    }
  }

  private String toJson(OutgoingRequestLog entry) {
    try {
      return objectMapper.writeValueAsString(entry);
    } catch (JsonProcessingException e) {
      log.error("Failed to serialize outgoing request log entry, aborting process", e);
      System.exit(1);
      return null;
    }
  }

  private record OutgoingRequestLog(
      String client, String url, int httpCode, long duration, String timestamp) {}
}
