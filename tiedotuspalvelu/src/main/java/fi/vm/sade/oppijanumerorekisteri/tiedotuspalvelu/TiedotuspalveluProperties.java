package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tiedotuspalvelu")
public record TiedotuspalveluProperties(
    String baseUrl,
    String apiBaseUrl,
    String opintopolkuHost,
    CasProperties cas,
    SuomiFiViestitProperties suomifiViestit,
    OppijanumerorekisteriProperties oppijanumerorekisteri,
    OtuvaProperties otuva,
    SwaggerUiProperties swaggerUi) {
  public record CasProperties(String serverUrl, String serviceBaseUrl) {}

  public record SuomiFiViestitProperties(
      Boolean enabled,
      String baseUrl,
      String username,
      String password,
      String senderServiceId,
      PostiProperties posti,
      SenderAddressProperties senderAddress) {}

  public record PostiProperties(String username, String password, String contactEmail) {}

  public record SenderAddressProperties(
      String name, String streetAddress, String zipCode, String city, String countryCode) {}

  public record OppijanumerorekisteriProperties(@NotBlank String baseUrl) {}

  public record OtuvaProperties(
      @NotBlank String oauth2TokenUrl,
      @NotBlank String oauth2ClientId,
      @NotBlank String oauth2ClientSecret) {}

  public record SwaggerUiProperties(@NotBlank String oauth2TokenUrl) {}
}
