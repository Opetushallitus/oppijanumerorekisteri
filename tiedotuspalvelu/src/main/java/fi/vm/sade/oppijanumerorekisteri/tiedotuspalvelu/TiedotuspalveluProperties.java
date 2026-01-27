package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tiedotuspalvelu")
public record TiedotuspalveluProperties(CasProperties cas) {
  public record CasProperties(String serverUrl, String serviceBaseUrl) {}
}
