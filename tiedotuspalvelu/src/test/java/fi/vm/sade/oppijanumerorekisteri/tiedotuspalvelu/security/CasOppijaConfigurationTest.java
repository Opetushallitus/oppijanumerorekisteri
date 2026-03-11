package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluApiTest;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

public class CasOppijaConfigurationTest extends TiedotuspalveluApiTest {

  @Test
  public void actuatorHealthIsPublic() throws Exception {
    mockMvc.perform(get("/omat-viestit/actuator/health")).andExpect(status().isOk());
  }

  @Test
  public void uiTiedotteetRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/omat-viestit/ui/tiedotteet"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "http://localhost:8888/realms/cas-oppija/protocol/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fomat-viestit%2Fj_spring_cas_security_check"));
  }

  @Test
  @WithMockUser
  public void uiTiedotteetIsAccessibleWhenAuthenticated() throws Exception {
    mockMvc
        .perform(get("/omat-viestit/ui/tiedotteet"))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));
  }

  @Test
  public void uiMeRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/omat-viestit/ui/me"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "http://localhost:8888/realms/cas-oppija/protocol/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fomat-viestit%2Fj_spring_cas_security_check"));
  }

  @Test
  public void oppijaIndexHtmlRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/omat-viestit/index.html"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "http://localhost:8888/realms/cas-oppija/protocol/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fomat-viestit%2Fj_spring_cas_security_check"));
  }

  @Test
  public void oppijaRootRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/omat-viestit/"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "http://localhost:8888/realms/cas-oppija/protocol/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fomat-viestit%2Fj_spring_cas_security_check"));
  }

  @Test
  public void swaggerUiIsPublic() throws Exception {
    mockMvc.perform(get("/omat-viestit/swagger-ui/index.html")).andExpect(status().isOk());
  }

  @Test
  public void openApiDocsArePublic() throws Exception {
    mockMvc.perform(get("/omat-viestit/v3/api-docs")).andExpect(status().isOk());
  }
}
