package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tiedotuspalvelu")
public record TiedotuspalveluProperties(
    String opintopolkuHost,
    CasProperties cas,
    SuomiFiViestitProperties suomifiViestit,
    OppijanumerorekisteriProperties oppijanumerorekisteri,
    Oauth2Properties oauth2) {
  public record CasProperties(String serverUrl, String serviceBaseUrl) {}

  public record SuomiFiViestitProperties(
      Boolean enabled, String baseUrl, String username, String password, String senderServiceId) {}

  public record OppijanumerorekisteriProperties(@NotBlank String baseUrl) {}

  public record Oauth2Properties(
      @NotBlank String tokenUrl, @NotBlank String clientId, @NotBlank String clientSecret) {}
}
