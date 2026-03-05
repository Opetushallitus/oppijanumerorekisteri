package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

public class OauthConfigurationTest extends TiedotuspalveluApiTest {

  @Test
  public void apiEndpointRejectsUnauthenticatedRequests() throws Exception {
    mockMvc
        .perform(get("/api/v1/tiedote/" + UUID.randomUUID()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void apiEndpointRejectsTokenWithoutRequiredRole() throws Exception {
    var token = createSignedJwt(Map.of());
    mockMvc
        .perform(
            get("/api/v1/tiedote/" + UUID.randomUUID())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
        .andExpect(status().isForbidden());
  }

  @Test
  public void apiEndpointIsAccessibleWithValidTokenAndRole() throws Exception {
    mockMvc
        .perform(get("/api/v1/tiedote/" + UUID.randomUUID()).with(validToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  public void postEndpointRejectsUnauthenticatedRequests() throws Exception {
    var content =
        """
        {"oppijanumero": "1.2.246.562.24.00000000001", "idempotencyKey": "%s"}"""
            .formatted(UUID.randomUUID().toString());
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void postEndpointRejectsTokenWithoutRequiredRole() throws Exception {
    var token = createSignedJwt(Map.of());
    var content =
        """
        {"oppijanumero": "1.2.246.562.24.00000000001", "idempotencyKey": "%s"}"""
            .formatted(UUID.randomUUID().toString());
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isForbidden());
  }

  @Test
  public void postEndpointIsAccessibleWithValidTokenAndRole() throws Exception {
    var content =
        """
        {"oppijanumero": "1.2.246.562.24.00000000001", "idempotencyKey": "%s"}"""
            .formatted(UUID.randomUUID().toString());
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .with(validToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isOk());
  }

  @Test
  public void uiEndpointRedirectsToCasWithBearerToken() throws Exception {
    var token = createSignedJwt(Map.of());
    mockMvc
        .perform(get("/ui/tiedotteet").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "https://cas.example.com/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fj_spring_cas_security_check"));
  }

  @Test
  public void rejectsExpiredToken() throws Exception {
    var expired = Instant.now().minusSeconds(600);
    var claims =
        new JWTClaimsSet.Builder()
            .issuer("https://test-issuer.example.com")
            .subject("test-subject")
            .issueTime(Date.from(expired.minusSeconds(300)))
            .expirationTime(Date.from(expired))
            .claim(
                "roles",
                Map.of(
                    "1.2.246.562.10.00000000001",
                    List.of("TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD")))
            .build();
    var signedJWT =
        new SignedJWT(
            new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(rsaKey.getKeyID()).build(), claims);
    signedJWT.sign(new RSASSASigner(rsaKey));
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + signedJWT.serialize())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"oppijanumero": "1.2.246.562.24.00000000001", "idempotencyKey": "%s"}"""
                        .formatted(UUID.randomUUID().toString())))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void rejectsTokenSignedWithWrongKey() throws Exception {
    var wrongKey = new RSAKeyGenerator(2048).keyID("wrong-key").generate();
    var now = Instant.now();
    var claims =
        new JWTClaimsSet.Builder()
            .issuer("https://test-issuer.example.com")
            .subject("test-subject")
            .issueTime(Date.from(now))
            .expirationTime(Date.from(now.plusSeconds(300)))
            .claim(
                "roles",
                Map.of(
                    "1.2.246.562.10.00000000001",
                    List.of("TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD")))
            .build();
    var signedJWT =
        new SignedJWT(
            new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(wrongKey.getKeyID()).build(), claims);
    signedJWT.sign(new RSASSASigner(wrongKey));
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + signedJWT.serialize())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"oppijanumero": "1.2.246.562.24.00000000001", "idempotencyKey": "%s"}"""
                        .formatted(UUID.randomUUID().toString())))
        .andExpect(status().isUnauthorized());
  }
}
