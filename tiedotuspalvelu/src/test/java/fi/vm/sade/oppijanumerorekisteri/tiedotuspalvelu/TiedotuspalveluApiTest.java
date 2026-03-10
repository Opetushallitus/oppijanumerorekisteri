package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
public class TiedotuspalveluApiTest {
  static final String OPH_ORGANISAATIO_OID = "1.2.246.562.10.00000000001";
  static final String KIELITUTKINNOSTA_TIEDOTTAJA = "kielitutkinnosta-tiedottaja";
  static final String KIELITUTKINNOSTA_TIEDOTTAJA_OID = "1.2.246.562.24.43006465835";
  static final String TOINEN_TIEDOTTAJA = "toinen-tiedottaja";
  static final String TOINEN_TIEDOTTAJA_OID = "1.2.246.562.24.21832615757";
  static final String OIKEUDETON = "oikeudeton";

  @Autowired protected ObjectMapper objectMapper;
  @Autowired protected MockMvc mockMvc;
  @Autowired protected TiedoteRepository tiedoteRepository;

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

  protected ApiController.TiedoteResponse getTiedote(UUID id) throws Exception {
    var response =
        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/v1/tiedote/%s".formatted(id))
                    .with(validToken())
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return objectMapper.readValue(response, ApiController.TiedoteResponse.class);
  }
}
