package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AccessTokenResponse(@JsonProperty("access_token") String accessToken) {
  public AccessTokenResponse {
    if (accessToken == null || accessToken.isBlank()) {
      throw new IllegalArgumentException("access_token is required");
    }
  }
}
