package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluApiTest;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

public class CasVirkailijaConfigurationTest extends TiedotuspalveluApiTest {
  @ParameterizedTest
  @ValueSource(strings = {"/tiedotuspalvelu/ui/me", "/tiedotuspalvelu/ui/tiedotteet/csv"})
  public void endpointsRequireAuthentication(String endpoint) throws Exception {
    mockMvc
        .perform(get(endpoint))
        .andExpect(status().isFound())
        .andExpect(
            header()
                .string(
                    "Location",
                    "http://localhost:8888/realms/cas-virkailija/protocol/cas/login?service=http%3A%2F%2Flocalhost%3A8080%2Ftiedotuspalvelu%2Fj_spring_cas_security_check"));
  }
}
