package fi.vm.sade.oppijanumerorekisteri;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.eq;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.EidasTunniste;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import fi.vm.sade.properties.OphProperties;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ExtendWith(OutputCaptureExtension.class)
public class RequestCallerFilterTest {

  @Autowired private OidGenerator oidGenerator;

  @Autowired private HenkiloRepository henkiloRepository;

  @LocalServerPort
  private int port;

  private static final KeyPair KEY_PAIR = generateKeyPair();

  private static final String KEY_ID = "test-key-id";

  @RegisterExtension
  static WireMockExtension wireMock =
          WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("cas.url", () -> wireMock.baseUrl() + "/cas");
    registry.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", wireMock::baseUrl);
    registry.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri", () -> wireMock.baseUrl() + "/oauth2/jwks");
    registry.add("oppijanumerorekisteri.oauth2.clientId", () -> "clientid");
    registry.add("oppijanumerorekisteri.oauth2.clientSecret", () -> "clientsecret");
    registry.add("kayttooikeus-service.s2s-checkUserPermissionToUser", () -> wireMock.baseUrl() + "/kayttooikeus-service/s2s/canUserAccessUser");
    registry.add("haku-app.baseurl", () -> wireMock.baseUrl() + "/haku-app");
    registry.add("ataru.baseurl", () -> wireMock.baseUrl() + "/lomake-editori");
  }

  @BeforeEach
  public void setup() {
    wireMock.resetAll();
  }

  @AfterAll
  static void teardown() {
    wireMock.resetAll();
  }

  @Test
  public void logsCallerHenkiloOidWhenCallerAuthenticatedWithOauth2(CapturedOutput output)
          throws Exception {
    var token = generateToken("1.2.246.562.24.43006465835");
    wireMock.stubFor(
            get(urlEqualTo("/oauth2/jwks"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody(buildJwksResponse())));
    wireMock.stubFor(
            post(urlEqualTo("/oauth2/token"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            // .withBody(buildTokenResponse("1.2.246.562.24.43006465835"))));
                            .withBody(buildTokenResponse(token))));
    wireMock.stubFor(
            post(urlEqualTo("/kayttooikeus-service/s2s/canUserAccessUser"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withBody("true")));
    wireMock.stubFor(
            post(urlEqualTo("/haku-app/applications/byPersonOid"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("{}")));
    wireMock.stubFor(
            post(urlEqualTo("/lomake-editori/api/external/onr/applications"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("[]")));

    var createdPersonOid = createHenkilo();

    var userAgent = UUID.randomUUID().toString();
    var xForwardedFor = UUID.randomUUID().toString();
    var referer = UUID.randomUUID().toString();

    HttpHeaders headers = new HttpHeaders();
    headers.add("User-Agent", userAgent);
    headers.add("X-Forwarded-For", xForwardedFor);
    headers.add("Referer", referer);

    var client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.ALWAYS).build();

    var healthRequest = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:" + port + "/actuator/health"))
            .header("Accept", "application/json")
            .GET()
            .build();

    var healthResponse = client.send(healthRequest, HttpResponse.BodyHandlers.ofString());

    System.out.println("health response: " + healthResponse);

    var request = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:" + port + "/henkilo/" + createdPersonOid + "/hakemukset"))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();

    var response = client.send(request, HttpResponse.BodyHandlers.ofString());

    System.out.println("response: " + response);

    assertThat(output).contains("\"callerHenkiloOid\": \"1.2.246.562.24.43006465835\"");
  }

  private String createHenkilo() {
    String eidasTunniste = "FOO/BAR/" + UUID.randomUUID().toString();
    var eidasTunnisteet = List.of(EidasTunniste.builder()
            .tunniste(eidasTunniste)
            .createdBy(oidGenerator.generateOID())
            .build());
    String oid = oidGenerator.generateOID();

    var now = ZonedDateTime.now();
    henkiloRepository.save(Henkilo.builder()
            .oidHenkilo(oid)
            .etunimet("Leon Elias")
            .kutsumanimi("Leon Elias")
            .sukunimi("Germany")
            .yksiloityEidas(eidasTunnisteet != null)
            .eidasTunnisteet(eidasTunnisteet)
            .created(Date.from(now.toInstant()))
            .modified(Date.from(now.toInstant()))
            .build());
    return oid;
  }

  private static KeyPair generateKeyPair() {
    try {
      KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
      gen.initialize(2048);
      return gen.generateKeyPair();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private static String buildJwksResponse() throws Exception {
    var publicKey = (RSAPublicKey) KEY_PAIR.getPublic();

    var rsaKey = new RSAKey.Builder(publicKey)
            .keyUse(KeyUse.SIGNATURE)
            .algorithm(JWSAlgorithm.RS256)
            .keyID(KEY_ID)
            .build();

    var jwkSet = new JWKSet(rsaKey);
    return jwkSet.toString(); // Serializes to {"keys":[{...}]}
  }

  private String buildTokenResponse(String accessToken) throws Exception {
    return """
            {
              "access_token": "%s",
              "token_type": "Bearer",
              "expires_in": 3600,
              "roles": ["1.2.246.562.10.00000000001", "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA", "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001"]
            }
            """.formatted(accessToken);
  }

  private static String generateToken(String subject) throws Exception {
    JWTClaimsSet claims = new JWTClaimsSet.Builder()
            .subject(subject)
            .issuer("http://localhost:" + wireMock.getPort())
            .audience("oppijanumerorekisteri")
            .expirationTime(Date.from(Instant.now().plusSeconds(3600)))
            .issueTime(Date.from(Instant.now()))
            .claim(
                    "roles",
                    Map.of(
                            "1.2.246.562.10.00000000001",
                            List.of("APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA", "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")))
            .build();

    SignedJWT jwt = new SignedJWT(
            new JWSHeader.Builder(JWSAlgorithm.RS256).build(),
            claims
    );
    jwt.sign(new RSASSASigner(KEY_PAIR.getPrivate()));
    return jwt.serialize();
  }
}
