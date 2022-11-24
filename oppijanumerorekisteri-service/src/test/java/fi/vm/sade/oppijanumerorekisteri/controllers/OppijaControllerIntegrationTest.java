package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.TestApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.Customization;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.skyscreamer.jsonassert.comparator.CustomComparator;
import org.skyscreamer.jsonassert.comparator.JSONComparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ActiveProfiles("dev")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {TestApplication.class, DevProperties.class, H2Configuration.class})
@Sql("/controller/oppija/integration/fixture/truncate-tables.sql")
@Sql("/controller/oppija/integration/fixture/tuonti-test-fixture.sql")
class OppijaControllerIntegrationTest {

    private static final String BASE_PATH = "/oppija";
    private final JSONComparator jsonComparator = new CustomComparator(JSONCompareMode.STRICT,
            new Customization("results[*].luotu", (o1, o2) -> true),
            new Customization("results[*].muokattu", (o1, o2) -> true));
    @MockBean
    KayttooikeusClient kayttooikeusClient;
    @MockBean
    PermissionChecker permissionChecker;
    @MockBean
    OrganisaatioService organisaatioService;
    @Autowired
    private TestRestTemplate restTemplate;
    @Value("${dev.username}")
    private String username;
    @Value("${dev.password}")
    private String password;

    @Test
    void listAdminSeesAll() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        ResponseEntity<String> response = httpBasic().getForEntity(BASE_PATH, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-superuser.json"), response.getBody(), jsonComparator);
    }

    @Test
    void listNormalUsersSeesOnlyOwn() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(false);
        given(permissionChecker.getOrganisaatioOids(any(), any())).willReturn(Set.of("tuonti1"));

        ResponseEntity<String> response = httpBasic().getForEntity(BASE_PATH, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-tuonti1.json"), response.getBody(), jsonComparator);
    }

    @Test
    void listEmpty() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(false);
        given(permissionChecker.getOrganisaatioOids(any(), any())).willReturn(Set.of("makkara"));

        ResponseEntity<String> response = httpBasic().getForEntity(BASE_PATH, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-empty.json"), response.getBody(), jsonComparator);
    }

    private TestRestTemplate httpBasic() {
        return restTemplate.withBasicAuth(username, password);
    }
}
