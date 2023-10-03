package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
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
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Sql("/controller/oppija/integration/fixture/truncate-tables.sql")
@Sql("/controller/oppija/integration/fixture/tuonti-test-fixture.sql")
@Sql("/db/migration/V20221109120000000__tuontikooste_view.sql")
@Sql("/db/migration/V20221215120000000__tuontikooste_fix.sql")
@Sql("/db/migration/V20230105120000000__tuontikooste_add_conflicts.sql")
@ActiveProfiles("dev")
@SpringBootTest(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, H2Configuration.class})
@AutoConfigureMockMvc
class OppijaControllerIntegrationTest {

    private static final String ACCESS_RIGHT = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA";

    private static final String BASE_PATH = "/oppija";
    private static final String KOOSTE = "/oppija/tuontikooste";
    private static final String TUONTIDATA = "/oppija/tuontidata/";
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

    @Autowired
    private MockMvc mvc;

    @Value("${dev.username}")
    private String username;
    @Value("${dev.password}")
    private String password;

    @Test
    void listAdminSeesAll() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-superuser.json"), fetch(BASE_PATH), listComparator);
    }

    @Test
    void listNormalUsersSeesOnlyOwn() throws Exception {
        given(permissionChecker.getAllOrganisaatioOids(any(), any())).willReturn(Set.of("tuonti1"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-tuonti1.json"), fetch(BASE_PATH), listComparator);
    }

    @Test
    void listEmpty() throws Exception {
        given(permissionChecker.getOrganisaatioOids(any(), any())).willReturn(Set.of("makkara"));
        given(permissionChecker.getAllOrganisaatioOids(any(), any(), any(), any())).willReturn(Set.of("makkara"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-empty.json"), fetch(BASE_PATH), listComparator);
    }

    @Test
    void koosteAdminSeesAll() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-superuser.json"), fetch(KOOSTE), koosteComparator);
    }

    @Test
    void koosteAdminSeesFilteredByAuthors() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-filter-author.json"), fetch(KOOSTE + "?author=tuonti1"), koosteComparator);
    }

    @Test
    void koosteAdminSeesFilteredById() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-filter-id.json"), fetch(KOOSTE + "?id=3"), koosteComparator);
    }

    @Test
    void koosteNormalUsersSeesOnlyOwn() throws Exception {
        given(permissionChecker.getAllOrganisaatioOids(any(), any())).willReturn(Set.of("tuonti1"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-tuonti1.json"), fetch(KOOSTE), koosteComparator);
    }

    @Test
    void koosteEmpty() throws Exception {
        given(permissionChecker.getAllOrganisaatioOids(any(), any())).willReturn(Set.of("makkara"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/kooste-empty.json"), fetch(KOOSTE), koosteComparator);
    }

    @Test
    void koosteTestPaging() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        assertThat(fetch(KOOSTE))
                .contains("\"numberOfElements\":3");

        assertThat(fetch(KOOSTE + "?pageSize=1&page=1&field=timestamp&sort=ASC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":\"tuonti1, tuonti1\"");

        assertThat(fetch(KOOSTE + "?pageSize=1&page=1&field=timestamp&sort=DESC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":null");

        assertThat(fetch(KOOSTE + "?pageSize=1&page=2&field=timestamp&sort=ASC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":null");

        assertThat(fetch(KOOSTE + "?pageSize=1&page=1&field=author&sort=ASC"))
                .contains("\"numberOfElements\":1")
                .contains("\"author\":null");
    }

    @Test
    void tuontidataHappyPath() throws Exception {
        given(permissionChecker.getAllOrganisaatioOids(any(), any())).willReturn(Set.of("tuonti1"));
        given(permissionChecker.getOrganisaatioOidsByKayttaja(any(), any(), any(), any())).willReturn(Set.of("tuonti1"));

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/tuontidata.json"), fetch(TUONTIDATA + 1), true);
    }

    @Test
    void tuontidataAccessDenied() throws Exception {
        given(permissionChecker.getAllOrganisaatioOids(any(), any())).willReturn(Set.of());
        mvc.perform(get(TUONTIDATA + 1).with(user(username).password(password)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void tuontidataNotFound() throws Exception {
        given(permissionChecker.getAllOrganisaatioOids(any(), any())).willReturn(Set.of());
        mvc.perform(get(TUONTIDATA + 1)
                        .with(user(username).password(password).roles(ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());
    }

    private String fetch(String url) throws Exception {
        return mvc.perform(get(url)
                        .with(user(username).password(password).roles(ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
    }
}
