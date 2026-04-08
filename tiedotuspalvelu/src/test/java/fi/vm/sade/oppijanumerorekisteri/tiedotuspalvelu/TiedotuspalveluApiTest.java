package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.api.TiedoteDto;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.api.TiedoteResponse;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security.CasOppijaUserDetailsService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Consumer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
public class TiedotuspalveluApiTest {
  protected static final String OPH_ORGANISAATIO_OID = "1.2.246.562.10.00000000001";
  protected static final String KIELITUTKINNOSTA_TIEDOTTAJA = "kielitutkinnosta-tiedottaja";
  protected static final String KIELITUTKINNOSTA_TIEDOTTAJA_OID = "1.2.246.562.24.43006465835";
  protected static final String TOINEN_TIEDOTTAJA = "toinen-tiedottaja";
  protected static final String TOINEN_TIEDOTTAJA_OID = "1.2.246.562.24.21832615757";
  protected static final String OIKEUDETON = "oikeudeton";

  @Autowired protected ObjectMapper objectMapper;
  @Autowired protected MockMvc mockMvc;
  @Autowired protected TiedoteRepository tiedoteRepository;
  @Autowired protected JdbcTemplate jdbc;

  protected void clearDatabase() {
    var tables =
        List.of(
            "tiedote", "suomifi_viesti", "suomifi_viestit_event", "suomifi_viestit_events_cursor");
    jdbc.execute("TRUNCATE TABLE " + String.join(", ", tables) + " CASCADE");
  }

  // Use the JWKS URI to derive the token URL — this always points to the real
  // Keycloak, even when subclasses override otuva.oauth2-token-url for WireMock.
  @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
  private String jwksUri;

  protected String fetchToken(String clientId) throws Exception {
    var tokenUrl = jwksUri.replace("/certs", "/token");
    var body = "grant_type=client_credentials&client_id=" + clientId + "&client_secret=" + clientId;
    var request =
        HttpRequest.newBuilder()
            .uri(URI.create(tokenUrl))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
            .build();
    var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    return new ObjectMapper().readTree(response.body()).get("access_token").asText();
  }

  protected RequestPostProcessor tokenFor(String clientId) {
    return request -> {
      try {
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + fetchToken(clientId));
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
      return request;
    };
  }

  protected RequestPostProcessor validToken() {
    return tokenFor(KIELITUTKINNOSTA_TIEDOTTAJA);
  }

  protected Tiedote createTiedote(String oppijanumero) throws Exception {
    return createTiedote(builder -> builder.oppijanumero(oppijanumero));
  }

  protected Tiedote createTiedote(Consumer<TiedoteDto.TiedoteDtoBuilder> requestModifier)
      throws Exception {
    var builder =
        TiedoteDto.builder()
            .oppijanumero(OidGenerator.generateHenkiloOid())
            .idempotencyKey(UUID.randomUUID().toString())
            .todistusBucketName("koski-tiedotuspalvelu")
            .todistusObjectKey("2d08a8dc-378e-40aa-a3ce-5d987795e619/tiedote.pdf")
            .opiskeluoikeusOid(Optional.of(OidGenerator.generateOpiskeluoikeusOid()));
    requestModifier.accept(builder);

    var content = objectMapper.writeValueAsString(builder.build());
    var response =
        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                        "/omat-viestit/api/v1/tiedote/kielitutkintotodistus")
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

  protected TiedoteResponse getTiedote(UUID id) throws Exception {
    var response =
        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/omat-viestit/api/v1/tiedote/%s".formatted(id))
                    .with(validToken())
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readValue(response, TiedoteResponse.class);
  }

  public static final String OPPIJANUMERO_NORDEA_DEMO = "1.2.246.562.24.73833272757";
  public final CasOppijaUserDetailsService.CasAuthenticatedUser OPPIJA_NORDEA_DEMO =
      CasOppijaUserDetailsService.CasAuthenticatedUser.builder()
          .username("suomi.fi,210281-9988")
          .attributes(
              Map.of(
                  "displayName", List.of("Nordea Demo"),
                  "givenName", List.of("Nordea"),
                  "sn", List.of("Demo"),
                  "nationalIdentificationNumber", List.of("210281-9988"),
                  "personOid", List.of(OPPIJANUMERO_NORDEA_DEMO)))
          .build();
}
