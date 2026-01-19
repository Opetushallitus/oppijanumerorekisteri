package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityConfigurationTest {

  @Autowired private MockMvc mockMvc;

  @Test
  public void actuatorHealthIsPublic() throws Exception {
    mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
  }

  @Test
  public void uiTiedotteetRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/ui/tiedotteet"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "https://cas.example.com/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fj_spring_cas_security_check"));
  }

  @Test
  @WithMockUser
  public void uiTiedotteetIsAccessibleWhenAuthenticated() throws Exception {
    mockMvc
        .perform(get("/ui/tiedotteet"))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));
  }

  @Test
  public void uiMeRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/ui/me"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "https://cas.example.com/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fj_spring_cas_security_check"));
  }

  @Test
  public void indexHtmlRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/index.html"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "https://cas.example.com/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fj_spring_cas_security_check"));
  }

  @Test
  public void rootRequiresCASAuthentication() throws Exception {
    mockMvc
        .perform(get("/"))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "https://cas.example.com/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Fj_spring_cas_security_check"));
  }
}
