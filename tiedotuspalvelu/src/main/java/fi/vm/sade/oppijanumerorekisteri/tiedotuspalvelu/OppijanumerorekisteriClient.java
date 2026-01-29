package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class OppijanumerorekisteriClient {

  private final ObjectMapper objectMapper;
  private final TiedotuspalveluProperties properties;
  private final HttpClient httpClient = HttpClient.newHttpClient();

  public Henkilotieto getHenkilotieto(String oid) {
    try {
      var httpRequest =
          HttpRequest.newBuilder()
              .uri(URI.create(properties.oppijanumerorekisteri().baseUrl() + "/henkilo/" + oid))
              .header("Accept", "application/json")
              .GET()
              .build();
      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200) {
        return objectMapper.readValue(response.body(), Henkilotieto.class);
      }
      throw new IllegalStateException(
          "Oppijanumerorekisteri call failed with status " + response.statusCode());
    } catch (IOException e) {
      throw new IllegalStateException("Oppijanumerorekisteri call failed with IO error", e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Oppijanumerorekisteri call interrupted", e);
    }
  }
}
