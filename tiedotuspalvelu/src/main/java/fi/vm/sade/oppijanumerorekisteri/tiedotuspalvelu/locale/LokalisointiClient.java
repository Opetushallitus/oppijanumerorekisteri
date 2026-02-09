package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@AllArgsConstructor
public class LokalisointiClient {

  private final ObjectMapper objectMapper;
  private final TiedotuspalveluProperties properties;
  private final HttpClient httpClient = HttpClient.newHttpClient();

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record LokalisointiEntry(String key, String locale, String value) {}

  public List<LokalisointiEntry> getLocalisations() {
    var url =
        "https://virkailija."
            + properties.opintopolkuHost()
            + "/lokalisointi/api/v1/localisation?category=omat-viestit";
    try {
      var httpRequest =
          HttpRequest.newBuilder()
              .uri(URI.create(url))
              .header("Accept", "application/json")
              .GET()
              .build();
      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200) {
        return objectMapper.readValue(
            response.body(), new TypeReference<List<LokalisointiEntry>>() {});
      }
      throw new IllegalStateException(
          "Lokalisointi API call failed with status " + response.statusCode());
    } catch (IOException e) {
      throw new IllegalStateException("Lokalisointi API call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Lokalisointi API call interrupted", e);
    }
  }
}
