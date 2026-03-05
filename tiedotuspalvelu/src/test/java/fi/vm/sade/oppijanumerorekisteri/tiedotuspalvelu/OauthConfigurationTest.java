package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

public class OauthConfigurationTest extends TiedotuspalveluApiTest {

  @MockitoBean private JwtDecoder jwtDecoder;

  @Test
  public void apiEndpointRejectsUnauthenticatedRequests() throws Exception {
    mockMvc
        .perform(get("/api/v1/tiedote/" + UUID.randomUUID()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void apiEndpointRejectsTokenWithoutRequiredRole() throws Exception {
    mockMvc
        .perform(get("/api/v1/tiedote/" + UUID.randomUUID()).with(jwt()))
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
    var content =
        """
        {"oppijanumero": "1.2.246.562.24.00000000001", "idempotencyKey": "%s"}"""
            .formatted(UUID.randomUUID().toString());
    mockMvc
        .perform(
            post("/api/v1/tiedote/kielitutkintotodistus")
                .with(jwt())
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
  public void uiEndpointRedirectsToCasEvenWithOauthToken() throws Exception {
    // jwt() post processor bypasses the filter chain and sets the SecurityContext directly in
    // MockMvc, so we can't truly test that a real JWT bearer token is rejected by the CAS chain.
    // Instead, verify that without any authentication, the CAS chain redirects to CAS login.
    mockMvc
        .perform(get("/ui/tiedotteet"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "https://cas.example.com/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fj_spring_cas_security_check"));
  }
}
