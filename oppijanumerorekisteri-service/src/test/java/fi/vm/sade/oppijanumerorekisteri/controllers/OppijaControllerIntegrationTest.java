package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@Slf4j
@ActiveProfiles("dev")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, H2Configuration.class})
@Sql("/controller/oppija/integration/fixture/truncate-tables.sql")
@Sql("/controller/oppija/integration/fixture/tuonti-test-fixture.sql")
@Sql("/db/migration/V20221109120000000__tuontikooste_view.sql")
class OppijaControllerIntegrationTest {

    private static final String BASE_PATH = "/oppija";
    private static final String KOOSTE = "/oppija/tuontikooste";
    private final JSONComparator listComparator = new CustomComparator(JSONCompareMode.STRICT,
            new Customization("results[*].luotu", (o1, o2) -> true),
            new Customization("results[*].muokattu", (o1, o2) -> true));
    private final JSONComparator koosteComparator = new CustomComparator(JSONCompareMode.STRICT,
            new Customization("content[*].timestamp", (o1, o2) -> true));
    @MockBean
    KayttooikeusClient kayttooikeusClient;
    @MockBean
    PermissionChecker permissionChecker;
    @MockBean
    OrganisaatioService organisaatioService;
    @LocalServerPort
    int randomPort;
    @Autowired
    private TestRestTemplate restTemplate;
    @Value("${dev.username}")
    private String username;
    @Value("${dev.password}")
    private String password;

    @BeforeEach
    void logRandomPortForH2Debug() {
        // If one needs to access in-memory database during development, enable following log statement
        // to access H2 mgmt console. connection settings: jdbc:h2:mem:db with empty credentials.
        // Set breakpoint somewhere. Be sure to only stop the current thread instead of all.
        // log.info("H2 debug console listening at http://localhost:{}/h2-console", randomPort);
    }

    @Test
    void listAdminSeesAll() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-superuser.json"), get(BASE_PATH), listComparator);
    }

    @Test
    void listNormalUsersSeesOnlyOwn() throws Exception {
        given(permissionChecker.getOrganisaatioOids(any(), any())).willReturn(Set.of("tuonti1"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-tuonti1.json"), get(BASE_PATH), listComparator);
    }

    @Test
    void listEmpty() throws Exception {
        given(permissionChecker.getOrganisaatioOids(any(), any())).willReturn(Set.of("makkara"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-empty.json"), get(BASE_PATH), listComparator);
    }

    @Test
    void koosteAdminSeesAll() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-superuser.json"), get(KOOSTE), koosteComparator);
    }

    @Test
    void koosteNormalUsersSeesOnlyOwn() throws Exception {
        given(permissionChecker.getOrganisaatioOids(any(), any())).willReturn(Set.of("tuonti1"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-tuonti1.json"), get(KOOSTE), koosteComparator);
    }

    @Test
    void koosteEmpty() throws Exception {
        given(permissionChecker.getOrganisaatioOids(any(), any())).willReturn(Set.of("makkara"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-empty.json"), get(KOOSTE), koosteComparator);
    }

    @Test
    void koosteTestPaging() {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        assertThat(get(KOOSTE))
                .contains("\"numberOfElements\":2");

        assertThat(get(KOOSTE + "?pageSize=1&page=1&field=timestamp&sort=ASC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":\"tuonti1, tuonti1\"");

        assertThat(get(KOOSTE + "?pageSize=1&page=1&field=timestamp&sort=DESC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":null");

        assertThat(get(KOOSTE + "?pageSize=1&page=2&field=timestamp&sort=ASC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":null");

        assertThat(get(KOOSTE + "?pageSize=1&page=1&field=author&sort=ASC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":null");
    }

    private String get(String url) {
        ResponseEntity<String> response = httpBasic().getForEntity(url, String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        return response.getBody();
    }

    private TestRestTemplate httpBasic() {
        return restTemplate.withBasicAuth(username, password);
    }
}
