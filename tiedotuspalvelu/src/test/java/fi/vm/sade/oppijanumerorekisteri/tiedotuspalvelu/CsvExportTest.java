package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security.CasVirkailijaUserDetailsService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class CsvExportTest extends TiedotuspalveluApiTest implements ResourceReader {
  @Test
  void csvEndpointRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/tiedotuspalvelu/ui/tiedotteet/csv")).andExpect(status().isFound());
  }

  @Test
  void csvEndpointReturnsForbiddenWithoutProperRole() throws Exception {
    mockMvc
        .perform(get("/tiedotuspalvelu/ui/tiedotteet/csv").with(user(VIRKAILIJA_WITHOUT_ROLES)))
        .andExpect(status().isForbidden());
  }

  @Test
  void csvEndpointWorksWithProperRole() throws Exception {
    mockMvc
        .perform(get("/tiedotuspalvelu/ui/tiedotteet/csv").with(user(VIRKAILIJA_WITH_CRUD_ROLE)))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", "text/csv"))
        .andExpect(
            header().string("Content-Disposition", "attachment; filename=\"tiedotteet.csv\""))
        .andReturn();
  }

  @BeforeEach
  void setup() {
    clearDatabase();
  }

  private final CasVirkailijaUserDetailsService.CasAuthenticatedUser VIRKAILIJA_WITH_CRUD_ROLE =
      CasVirkailijaUserDetailsService.CasAuthenticatedUser.builder()
          .username("tiinatiedottaja")
          .attributes(
              Map.of(
                  "oidHenkilo",
                  List.of("1.2.246.562.24.52606915412"),
                  "kayttajaTyyppi",
                  List.of("VIRKAILIJA"),
                  "idpEntityId",
                  List.of("usernamePassword")))
          .authorities(
              List.of(
                  new SimpleGrantedAuthority(
                      "ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD"),
                  new SimpleGrantedAuthority(
                      "ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD_1.2.246.562.10.00000000001")))
          .build();

  private final CasVirkailijaUserDetailsService.CasAuthenticatedUser VIRKAILIJA_WITHOUT_ROLES =
      CasVirkailijaUserDetailsService.CasAuthenticatedUser.builder()
          .username("emmieioikkia")
          .attributes(
              Map.of(
                  "oidHenkilo",
                  List.of("1.2.246.562.24.38583027941"),
                  "kayttajaTyyppi",
                  List.of("VIRKAILIJA"),
                  "idpEntityId",
                  List.of("usernamePassword")))
          .authorities(List.of())
          .build();
}
