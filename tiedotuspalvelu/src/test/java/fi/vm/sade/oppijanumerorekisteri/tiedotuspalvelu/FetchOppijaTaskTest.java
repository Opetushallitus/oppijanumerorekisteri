package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.http.Request;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import com.github.tomakehurst.wiremock.matching.MatchResult;
import com.github.tomakehurst.wiremock.matching.ValueMatcher;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.SignedJWT;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija.FetchOppijaTask;
import java.net.URL;
import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public class FetchOppijaTaskTest extends TiedotuspalveluApiTest implements ResourceReader {

  @Autowired private FetchOppijaTask fetchOppijaTask;

  @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
  private String jwksUri;

  @RegisterExtension
  static WireMockExtension wireMock =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    registry.add("tiedotuspalvelu.oppijanumerorekisteri.base-url", wireMock::baseUrl);
  }

  @BeforeEach
  public void setup() {
    clearDatabase();
    wireMock.resetAll();
  }

  @Test
  public void respectsNextRetryTime() throws Exception {
    stubOppijanumerorekisteri(
        "/henkilo/.*", readResource("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + ".json"));

    var futureTiedote = createTiedote("1.2.246.562.24.00000000001");
    futureTiedote.setNextRetry(java.time.OffsetDateTime.now().plusHours(1));
    futureTiedote.setRetryCount(1);
    tiedoteRepository.save(futureTiedote);

    var pastTiedote = createTiedote("1.2.246.562.24.00000000002");
    pastTiedote.setNextRetry(java.time.OffsetDateTime.now().minusMinutes(1));
    pastTiedote.setRetryCount(1);
    tiedoteRepository.save(pastTiedote);

    fetchOppijaTask.execute();

    var futureTiedoteUpdated = tiedoteRepository.findById(futureTiedote.getId()).orElseThrow();
    assertNull(futureTiedoteUpdated.getProcessedAt());
    assertEquals(1, futureTiedoteUpdated.getRetryCount());

    var pastTiedoteUpdated = tiedoteRepository.findById(pastTiedote.getId()).orElseThrow();
    assertNotNull(pastTiedoteUpdated.getProcessedAt());
  }

  @Test
  public void setsStateToSuomiFiViestiHetulliselle() throws Exception {
    stubOppijanumerorekisteri(
        "/henkilo/.*", readResource("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + ".json"));

    var tiedote = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);
    assertEquals(Tiedote.STATE_OPPIJAN_VALIDOINTI, tiedote.getState());

    fetchOppijaTask.execute();

    var updated = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertEquals(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS, updated.getState());
  }

  @Test
  public void usesVtjVakinainenKotimainenOsoiteForViesti() throws Exception {
    stubOppijanumerorekisteri(
        "/henkilo/.*", readResource("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + ".json"));

    var before = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);
    assertEquals(Tiedote.STATE_OPPIJAN_VALIDOINTI, before.getState());
    fetchOppijaTask.execute();

    var after = tiedoteRepository.findById(before.getId()).orElseThrow();
    assertEquals(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS, after.getState());
    assertThat(after.getViesti().getStreetAddress()).isEqualTo("Klemetinkatu 9 A 2");
    assertThat(after.getViesti().getZipCode()).isEqualTo("65100");
    assertThat(after.getViesti().getCity()).isEqualTo("VAASA");
  }

  @Test
  public void handlesOppijanumerorekisteriFailure() throws Exception {
    wireMock.stubFor(
        get(urlPathMatching("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES))
            .willReturn(aResponse().withStatus(500)));

    var tiedote = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);

    fetchOppijaTask.execute();

    var updatedTiedote = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertNull(updatedTiedote.getProcessedAt());
    assertEquals(1, updatedTiedote.getRetryCount());
    assertNotNull(updatedTiedote.getNextRetry());
  }

  @Test
  public void handlesMissingOppijaAddressData() throws Exception {
    stubOppijanumerorekisteri(
        "/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES,
        readResource("/henkilo/" + OPPIJANUMERO_HELLIN_SEVILLANTES + "-no-address.json"));

    var tiedote = createTiedote(OPPIJANUMERO_HELLIN_SEVILLANTES);

    fetchOppijaTask.execute();

    var updatedTiedote = tiedoteRepository.findById(tiedote.getId()).orElseThrow();
    assertNull(updatedTiedote.getProcessedAt());
    assertEquals(1, updatedTiedote.getRetryCount());
    assertNotNull(updatedTiedote.getNextRetry());
  }

  private void stubOppijanumerorekisteri(String urlPattern, String responseBody) {
    wireMock.stubFor(
        get(urlPathMatching(urlPattern))
            .andMatching(validBearerToken())
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody(responseBody)));
  }

  private ValueMatcher<Request> validBearerToken() {
    return request -> {
      var auth = request.getHeader("Authorization");
      if (auth == null || !auth.startsWith("Bearer ")) {
        return MatchResult.noMatch();
      }
      try {
        var token = auth.substring("Bearer ".length());
        var jwt = SignedJWT.parse(token);
        var jwkSet = JWKSet.load(new URL(jwksUri));
        var jwk = jwkSet.getKeyByKeyId(jwt.getHeader().getKeyID());
        if (jwk == null) return MatchResult.noMatch();
        var verifier = new RSASSAVerifier(((RSAKey) jwk).toRSAPublicKey());
        if (!jwt.verify(verifier)) return MatchResult.noMatch();
        var expiration = jwt.getJWTClaimsSet().getExpirationTime();
        if (expiration == null || expiration.before(new Date())) return MatchResult.noMatch();
        return MatchResult.exactMatch();
      } catch (Exception e) {
        return MatchResult.noMatch();
      }
    };
  }
}
