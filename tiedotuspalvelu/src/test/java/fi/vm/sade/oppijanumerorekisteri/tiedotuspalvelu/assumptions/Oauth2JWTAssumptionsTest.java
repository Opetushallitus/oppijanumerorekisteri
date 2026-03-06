package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.assumptions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class Oauth2JWTAssumptionsTest {

  @Autowired TiedotuspalveluProperties properties;

  @Test
  void assumeOtuvaWouldReturnHenkiloOidAsSubject() throws Exception {
    assertThat(fetchTokenClaimsFromOtuvaMock("kielitutkinnosta-tiedottaja").getSubject())
        .isEqualTo("1.2.246.562.24.43006465835");
    assertThat(fetchTokenClaimsFromOtuvaMock("oikeudeton").getSubject())
        .isEqualTo("1.2.246.562.24.35369251539");
  }

  @Test
  void assumeOtuvaWouldReturnUsernameAsAudience() throws Exception {
    assertThat(fetchTokenClaimsFromOtuvaMock("kielitutkinnosta-tiedottaja").getAudience())
        .containsExactly("kielitutkinnosta-tiedottaja");
    assertThat(fetchTokenClaimsFromOtuvaMock("oikeudeton").getAudience())
        .containsExactly("oikeudeton");
  }

  @Test
  void assumeOtuvaWouldReturnRolesAsMapOfOrgOidToRoleList() throws Exception {
    var claims = fetchTokenClaimsFromOtuvaMock("kielitutkinnosta-tiedottaja");
    var roles = (Map<String, List<String>>) claims.getClaim("roles");
    assertThat(roles).containsKey("1.2.246.562.10.00000000001");
    assertThat(roles.get("1.2.246.562.10.00000000001"))
        .containsExactly("TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD");
  }

  @Test
  void assumeOtuvaWouldReturnClaimsWeDoNotDirectlyHandle() throws Exception {
    var claims = fetchTokenClaimsFromOtuvaMock("kielitutkinnosta-tiedottaja");
    assertThat(claims.getIssuer()).isNotNull();
    assertThat(claims.getExpirationTime()).isNotNull();
    assertThat(claims.getIssueTime()).isNotNull();
  }

  @Test
  void assumeOtuvaWouldReturnEmptyRoleListIfUserHasNoKäyttöoikeus() throws Exception {
    var claims = fetchTokenClaimsFromOtuvaMock("oikeudeton");
    var roles = (Map<String, List<String>>) claims.getClaim("roles");
    assertThat(roles).isNotNull();
    assertThat(roles).isEmpty();
  }

  private JWTClaimsSet fetchTokenClaimsFromOtuvaMock(String clientId) throws Exception {
    var tokenUrl = properties.otuva().oauth2TokenUrl();
    var clientSecret = clientId;
    var body =
        "grant_type=client_credentials&client_id=" + clientId + "&client_secret=" + clientSecret;
    var request =
        HttpRequest.newBuilder()
            .uri(URI.create(tokenUrl))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
            .build();
    var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    assertEquals(200, response.statusCode(), "Token request failed: " + response.body());

    var tokenResponse = new ObjectMapper().readTree(response.body());
    var accessToken = tokenResponse.get("access_token").asText();
    return SignedJWT.parse(accessToken).getJWTClaimsSet();
  }
}
