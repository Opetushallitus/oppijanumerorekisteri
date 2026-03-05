package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.time.Instant;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
public class TiedotuspalveluApiTest {
  static final String OPH_ORGANISAATIO_OID = "1.2.246.562.10.00000000001";
  static final String PALVELUKAYTTAJA_HENKILO_OID = OidGenerator.generateHenkiloOid();
  static RSAKey rsaKey;
  static WireMockServer jwksServer;

  static {
    try {
      rsaKey = new RSAKeyGenerator(2048).keyID("test-key").generate();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    jwksServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
    jwksServer.start();
    jwksServer.stubFor(
        WireMock.get(WireMock.urlEqualTo("/.well-known/jwks.json"))
            .willReturn(
                WireMock.aResponse()
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"keys\":[" + rsaKey.toPublicJWK().toJSONString() + "]}")));
  }

  @Autowired protected ObjectMapper objectMapper;
  @Autowired protected MockMvc mockMvc;
  @Autowired protected TiedoteRepository tiedoteRepository;

  @DynamicPropertySource
  static void registerJwksProperties(DynamicPropertyRegistry registry) {
    registry.add(
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri",
        () -> jwksServer.baseUrl() + "/.well-known/jwks.json");
  }

  protected String createSignedJwt(Map<String, Object> extraClaims) throws Exception {
    var now = Instant.now();
    var builder =
        new JWTClaimsSet.Builder()
            .issuer("https://test-issuer.example.com")
            .subject(PALVELUKAYTTAJA_HENKILO_OID)
            .audience("palvelukayttaja")
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

  protected RequestPostProcessor validToken() {
    return request -> {
      try {
        var token =
            createSignedJwt(
                Map.of(
                    "roles",
                    Map.of(
                        OPH_ORGANISAATIO_OID,
                        List.of("TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD"))));
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
      return request;
    };
  }

  protected Tiedote createTiedote(String oppijanumero) throws Exception {
    var content =
        objectMapper.writeValueAsString(
            new ApiController.TiedoteDto(
                oppijanumero,
                UUID.randomUUID().toString(),
                null,
                Optional.of(OidGenerator.generateOpiskeluoikeusOid())));
    var response =
        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                        "/api/v1/tiedote/kielitutkintotodistus")
                    .with(validToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var id = UUID.fromString(objectMapper.readTree(response).get("id").asText());
    return tiedoteRepository.findById(id).orElseThrow();
  }
}
