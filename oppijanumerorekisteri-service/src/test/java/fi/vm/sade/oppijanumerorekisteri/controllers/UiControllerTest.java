package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.Customization;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.skyscreamer.jsonassert.comparator.CustomComparator;
import org.skyscreamer.jsonassert.comparator.JSONComparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.YLEISTUNNISTE_LUONTI_ACCESS_RIGHT;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Sql("/sql/truncate_data.sql")
@Sql("/controller/oppija/integration/fixture/tuonti-test-fixture.sql")
@SpringBootTest
@AutoConfigureMockMvc
class UiControllerTest {

    @Autowired
    private MockMvc mvc;

    @Value("${dev.username}")
    private String username;

    @Value("${dev.password}")
    private String password;

    @MockitoBean
    PermissionChecker permissionChecker;

    private final JSONComparator listComparator = new CustomComparator(JSONCompareMode.STRICT,
            new Customization("results[*].luotu", (o1, o2) -> true),
            new Customization("results[*].muokattu", (o1, o2) -> true));

    @Test
    void listVirheet() throws Exception {
        given(permissionChecker.isSuperUserOrCanReadAll()).willReturn(true);

        var result = mvc.perform(get("/internal/oppijoidentuonti/virheet")
                        .with(user(username).password(password).roles("APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/oppija/integration/response/list-superuser.json"), result, listComparator);
    }
}
