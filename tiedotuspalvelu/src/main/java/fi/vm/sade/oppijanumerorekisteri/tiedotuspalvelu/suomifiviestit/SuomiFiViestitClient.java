package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.LoggingHttpClient;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.*;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class SuomiFiViestitClient {

  private static final String CONTENT_TYPE_JSON = "application/json";

  private final ObjectMapper objectMapper;
  private final TiedotuspalveluProperties properties;
  private final LoggingHttpClient httpClient = new LoggingHttpClient("suomifi-viestit", true);

  public String sendElectronicMessage(ElectronicMessageRequest request) {
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
      } else if (response.statusCode() == 400 && response.body().contains("MAILBOX_NOT_IN_USE")) {
        throw new MailboxNotInUseException();
      } else {
        throw new IllegalStateException(
            "Suomi.fi viestit call failed with status " + response.statusCode());
      }
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize Suomi.fi viesti request", e);
    } catch (IOException e) {
      throw new IllegalStateException("Suomi.fi viestit call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Suomi.fi viestit call interrupted", e);
    }
  }

  public String sendMultichannelMessage(MultichannelMessageRequest request) {
    var token = fetchAccessToken();
    try {
      var payload = objectMapper.writeValueAsString(request);
      var httpRequest =
          HttpRequest.newBuilder()
              .uri(URI.create(properties.suomifiViestit().baseUrl() + "/v2/messages"))
              .header("Content-Type", CONTENT_TYPE_JSON)
              .header("Authorization", "Bearer " + token)
              .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
              .build();
      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() == 200 || response.statusCode() == 409) {
        var sendResponse = objectMapper.readValue(response.body(), MultichannelSendResponse.class);
        return sendResponse.messageId();
      }
      throw new IllegalStateException(
          "Suomi.fi viestit message call failed with status " + response.statusCode());
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize Suomi.fi message request", e);
    } catch (IOException e) {
      throw new IllegalStateException("Suomi.fi viestit message call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Suomi.fi viestit message call interrupted", e);
    }
  }

  public String sendAttachment(String filename, String contentType, byte[] content) {
    var token = fetchAccessToken();
    try {
      var boundary = UUID.randomUUID().toString();
      var body = buildMultipartBody(boundary, filename, contentType, content);
      var httpRequest =
          HttpRequest.newBuilder()
              .uri(URI.create(properties.suomifiViestit().baseUrl() + "/v2/attachments"))
              .header("Content-Type", "multipart/form-data; boundary=" + boundary)
              .header("Authorization", "Bearer " + token)
              .POST(HttpRequest.BodyPublishers.ofByteArray(body))
              .build();
      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() == 200 || response.statusCode() == 201) {
        var attachmentResponse = objectMapper.readValue(response.body(), AttachmentResponse.class);
        return attachmentResponse.attachmentId();
      }
      throw new IllegalStateException(
          "Suomi.fi viestit attachment call failed with status " + response.statusCode());
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to parse Suomi.fi attachment response", e);
    } catch (IOException e) {
      throw new IllegalStateException("Suomi.fi viestit attachment call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Suomi.fi viestit attachment call interrupted", e);
    }
  }

  private byte[] buildMultipartBody(
      String boundary, String filename, String contentType, byte[] content) {
    var header =
        ("""
            --%s\r
            Content-Disposition: form-data; name="file"; filename="%s"\r
            Content-Type: %s\r
            \r
            """
                .formatted(boundary, filename, contentType))
            .getBytes(StandardCharsets.UTF_8);
    var footer = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);
    var body = new byte[header.length + content.length + footer.length];
    System.arraycopy(header, 0, body, 0, header.length);
    System.arraycopy(content, 0, body, header.length, content.length);
    System.arraycopy(footer, 0, body, header.length + content.length, footer.length);
    return body;
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

  public EventsResponse fetchEvents(String continuationToken) {
    var token = fetchAccessToken();
    try {
      var uri = properties.suomifiViestit().baseUrl() + "/v2/events";
      if (continuationToken != null) {
        uri += "?continuationToken=" + continuationToken;
      }
      var httpRequest =
          HttpRequest.newBuilder()
              .uri(URI.create(uri))
              .header("Authorization", "Bearer " + token)
              .GET()
              .build();
      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException(
            "Suomi.fi events call failed with status " + response.statusCode());
      }
      return objectMapper.readValue(response.body(), EventsResponse.class);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to parse Suomi.fi events response", e);
    } catch (IOException e) {
      throw new IllegalStateException("Suomi.fi events call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Suomi.fi events call interrupted", e);
    }
  }
}
