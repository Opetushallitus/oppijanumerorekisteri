package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security.CasOppijaUserDetailsService;
import java.lang.reflect.Constructor;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public class UiControllerTest extends TiedotuspalveluApiTest {

  @BeforeEach
  public void setup() throws Exception {
    clearDatabase();

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
    createTiedote(OPPIJANUMERO_NORDEA_DEMO);
    createTiedote(OPPIJANUMERO_NORDEA_DEMO);
    createTiedote("1.2.246.562.24.66666666666");

    var response =
        mockMvc
            .perform(get("/omat-viestit/ui/tiedotteet").with(user(OPPIJA_NORDEA_DEMO)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UiController.TiedoteDto[] tiedotteet =
        objectMapper.readValue(response, UiController.TiedoteDto[].class);

    assertEquals(2, tiedotteet.length);

    for (UiController.TiedoteDto tiedote : tiedotteet) {
      assertNotNull(tiedote.id());
      assertFalse(tiedote.id().toString().isEmpty());
    }
  }

  @Test
  public void returnsTiedotteetInOrderFromNewestToOldest() throws Exception {
    var t1 = createTiedote(OPPIJANUMERO_NORDEA_DEMO);
    var t2 = createTiedote(OPPIJANUMERO_NORDEA_DEMO);
    var t3 = createTiedote(OPPIJANUMERO_NORDEA_DEMO);

    var response =
        mockMvc
            .perform(get("/omat-viestit/ui/tiedotteet").with(user(OPPIJA_NORDEA_DEMO)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UiController.TiedoteDto[] tiedotteet =
        objectMapper.readValue(response, UiController.TiedoteDto[].class);

    assertEquals(3, tiedotteet.length);
    assertEquals(t3.getId(), tiedotteet[0].id());
    assertEquals(t2.getId(), tiedotteet[1].id());
    assertEquals(t1.getId(), tiedotteet[2].id());
  }

  private static CasOppijaUserDetailsService.CasAuthenticatedUser casPrincipal(
      String username, Map<String, List<String>> attributes) throws Exception {
    Constructor<CasOppijaUserDetailsService.CasAuthenticatedUser> constructor =
        CasOppijaUserDetailsService.CasAuthenticatedUser.class.getDeclaredConstructor(
            String.class, Map.class);
    constructor.setAccessible(true);
    return constructor.newInstance(username, attributes);
  }

  private static final String OPPIJANUMERO_NORDEA_DEMO = "1.2.246.562.24.73833272757";
  private final CasOppijaUserDetailsService.CasAuthenticatedUser OPPIJA_NORDEA_DEMO =
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
