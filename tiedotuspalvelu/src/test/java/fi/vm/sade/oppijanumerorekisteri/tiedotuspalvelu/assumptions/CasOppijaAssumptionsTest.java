package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.assumptions;

import static org.assertj.core.api.Assertions.assertThat;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CasOppijaAssumptionsTest extends CasAssumptionsTestBase {

  @Autowired TiedotuspalveluProperties properties;

  @Test
  void assumeCasOppijaWouldReturnHetuPrefixedUsername() throws Exception {
    var assertion = authenticateAndValidate("suomi.fi,210281-9988", "210281-9988");
    assertThat(assertion.getPrincipal().getName()).isEqualTo("suomi.fi,210281-9988");
  }

  @Test
  void assumeCasOppijaWouldReturnDisplayName() throws Exception {
    var assertion = authenticateAndValidate("suomi.fi,210281-9988", "210281-9988");
    assertThat(assertion.getPrincipal().getAttributes().get("displayName"))
        .isEqualTo("Nordea Demo");
  }

  @Test
  void assumeCasOppijaWouldReturnGivenName() throws Exception {
    var assertion = authenticateAndValidate("suomi.fi,210281-9988", "210281-9988");
    assertThat(assertion.getPrincipal().getAttributes().get("givenName")).isEqualTo("Nordea");
  }

  @Test
  void assumeCasOppijaWouldReturnSurname() throws Exception {
    var assertion = authenticateAndValidate("suomi.fi,210281-9988", "210281-9988");
    assertThat(assertion.getPrincipal().getAttributes().get("sn")).isEqualTo("Demo");
  }

  @Test
  void assumeCasOppijaWouldReturnNationalIdentificationNumber() throws Exception {
    var assertion = authenticateAndValidate("suomi.fi,210281-9988", "210281-9988");
    assertThat(assertion.getPrincipal().getAttributes().get("nationalIdentificationNumber"))
        .isEqualTo("210281-9988");
  }

  @Test
  void assumeCasOppijaWouldReturnPersonOid() throws Exception {
    var assertion = authenticateAndValidate("suomi.fi,210281-9988", "210281-9988");
    assertThat(assertion.getPrincipal().getAttributes().get("personOid"))
        .isEqualTo("1.2.246.562.24.73833272757");
  }

  @Override
  String casServerUrl() {
    return properties.casOppija().serverUrl();
  }

  @Override
  String serviceBaseUrl() {
    return properties.casOppija().serviceBaseUrl();
  }
}
