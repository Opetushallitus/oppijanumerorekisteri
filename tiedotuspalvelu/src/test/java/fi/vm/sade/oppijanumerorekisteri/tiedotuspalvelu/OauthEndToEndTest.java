package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
public class OauthEndToEndTest {

  static RSAKey rsaKey;

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  @Autowired private MockMvc mockMvc;

  @BeforeEach
  void setupJwks() throws Exception {
    if (rsaKey == null) {
      rsaKey = new RSAKeyGenerator(2048).keyID("test-key").generate();
    }
    var jwks = "{\"keys\":[" + rsaKey.toPublicJWK().toJSONString() + "]}";
    wireMock.stubFor(
        WireMock.get(WireMock.urlEqualTo("/.well-known/jwks.json"))
            .willReturn(
                WireMock.aResponse()
                    .withHeader("Content-Type", "application/json")
                    .withBody(jwks)));
  }

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add(
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri",
        () -> wireMock.baseUrl() + "/.well-known/jwks.json");
  }

  private String createSignedJwt(Map<String, Object> extraClaims) throws Exception {
    var now = Instant.now();
    var builder =
        new JWTClaimsSet.Builder()
            .issuer("https://test-issuer.example.com")
            .subject("test-subject")
            .issueTime(Date.from(now))
            .expirationTime(Date.from(now.plusSeconds(300)));
    extraClaims.forEach(builder::claim);
    var signedJWT =
        new SignedJWT(
            new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(rsaKey.getKeyID()).build(),
            builder.build());
    signedJWT.sign(new RSASSASigner(rsaKey));
    return signedJWT.serialize();
  }

  @Test
  public void rejectsRequestWithoutToken() throws Exception {
    mockMvc.perform(testPostRequest()).andExpect(status().isUnauthorized());
  }

  @Test
  public void rejectsTokenWithoutRequiredRole() throws Exception {
    var token = createSignedJwt(Map.of());
    mockMvc
        .perform(testPostRequest().header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
        .andExpect(status().isForbidden());
  }

  @Test
  public void acceptsTokenWithCorrectRolesClaim() throws Exception {
    var token =
        createSignedJwt(
            Map.of(
                "roles",
                Map.of(
                    "1.2.246.562.10.00000000001",
                    List.of("TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD"))));
    mockMvc
        .perform(testPostRequest().header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
        .andExpect(status().isOk());
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
            testPostRequest().header(HttpHeaders.AUTHORIZATION, "Bearer " + signedJWT.serialize()))
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
            testPostRequest().header(HttpHeaders.AUTHORIZATION, "Bearer " + signedJWT.serialize()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void uiEndpointRedirectsToCasWithBearerToken() throws Exception {
    var token =
        createSignedJwt(
            Map.of(
                "roles",
                Map.of(
                    "1.2.246.562.10.00000000001",
                    List.of("TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD"))));
    mockMvc
        .perform(get("/ui/tiedotteet").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
        .andExpect(status().isFound());
  }

  private MockHttpServletRequestBuilder testPostRequest() {
    var body =
        """
        {
          "oppijanumero": "1.2.246.562.24.00000000001",
          "idempotencyKey": "%s"
        }
        """
            .formatted(UUID.randomUUID().toString());
    return post("/api/v1/tiedote/kielitutkintotodistus")
        .contentType(MediaType.APPLICATION_JSON)
        .content(body);
  }
}
