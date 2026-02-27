package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class SuomiFiViestitClient {

  private static final String CONTENT_TYPE_JSON = "application/json";

  private final ObjectMapper objectMapper;
  private final TiedotuspalveluProperties properties;
  private final LoggingHttpClient httpClient = new LoggingHttpClient("suomifi-viestit");

  public String send(SuomiFiViestitElectronicMessageRequest request) {
    var token = fetchAccessToken();
    try {
      var payload = objectMapper.writeValueAsString(request);
      var httpRequest =
          HttpRequest.newBuilder()
              .uri(URI.create(properties.suomifiViestit().baseUrl() + "/v2/messages/electronic"))
              .header("Content-Type", CONTENT_TYPE_JSON)
              .header("Authorization", "Bearer " + token)
              .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
              .build();
      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200 || response.statusCode() == 409) {
        var sendResponse = objectMapper.readValue(response.body(), SendResponse.class);
        return sendResponse.messageId();
      }
      throw new IllegalStateException(
          "Suomi.fi viestit call failed with status " + response.statusCode());
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize Suomi.fi viesti request", e);
    } catch (IOException e) {
      throw new IllegalStateException("Suomi.fi viestit call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Suomi.fi viestit call interrupted", e);
    }
  }

  private String fetchAccessToken() {
    try {
      var payload =
          objectMapper.writeValueAsString(
              new AccessTokenRequestBody(
                  properties.suomifiViestit().username(), properties.suomifiViestit().password()));
      var httpRequest =
          HttpRequest.newBuilder()
              .uri(URI.create(properties.suomifiViestit().baseUrl() + "/v1/token"))
              .header("Content-Type", CONTENT_TYPE_JSON)
              .POST(HttpRequest.BodyPublishers.ofString(payload))
              .build();
      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException(
            "Suomi.fi token call failed with status " + response.statusCode());
      }
      var tokenResponse = objectMapper.readValue(response.body(), AccessTokenResponse.class);
      return tokenResponse.accessToken();
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize Suomi.fi token request", e);
    } catch (IOException e) {
      throw new IllegalStateException("Suomi.fi token call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Suomi.fi token call interrupted", e);
    }
  }

  record SendResponse(String messageId) {}

  private record AccessTokenRequestBody(String username, String password) {}

  private record AccessTokenResponse(@JsonProperty("access_token") String accessToken) {
    AccessTokenResponse {
      if (accessToken == null || accessToken.isBlank()) {
        throw new IllegalArgumentException("access_token is required");
      }
    }
  }
}
