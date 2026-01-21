package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService;
import java.lang.reflect.Constructor;
import java.util.List;
import java.util.Map;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class UiControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private TiedoteRepository tiedoteRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  @BeforeEach
  public void setup() throws Exception {
    tiedoteRepository.deleteAll();

    var principal =
        casPrincipal(
            "test-user",
            Map.of(
                "firstName", List.of("Testi"), "personOid", List.of("1.2.246.562.24.00000000001")));

    var auth =
        new TestingAuthenticationToken(
            principal, "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
    SecurityContextHolder.getContext().setAuthentication(auth);
  }

  @Test
  public void returnsOnlyCurrentUsersTiedotteet() throws Exception {
    tiedoteRepository.save(
        Tiedote.builder()
            .oppijanumero("1.2.246.562.24.00000000001")
            .url("https://a.example")
            .build());
    tiedoteRepository.save(
        Tiedote.builder()
            .oppijanumero("1.2.246.562.24.00000000001")
            .url("https://b.example")
            .build());
    tiedoteRepository.save(
        Tiedote.builder()
            .oppijanumero("1.2.246.562.24.00000000002")
            .url("https://c.example")
            .build());

    mockMvc
        .perform(get("/ui/tiedotteet"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", Matchers.hasSize(2)))
        .andExpect(jsonPath("$[0].url").value("https://a.example"))
        .andExpect(jsonPath("$[0].id").isNotEmpty())
        .andExpect(jsonPath("$[1].url").value("https://b.example"))
        .andExpect(jsonPath("$[1].id").isNotEmpty());
  }

  private static CasUserDetailsService.CasAuthenticatedUser casPrincipal(
      String username, Map<String, List<String>> attributes) throws Exception {
    Constructor<CasUserDetailsService.CasAuthenticatedUser> constructor =
        CasUserDetailsService.CasAuthenticatedUser.class.getDeclaredConstructor(
            String.class, Map.class);
    constructor.setAccessible(true);
    return constructor.newInstance(username, attributes);
  }
}
