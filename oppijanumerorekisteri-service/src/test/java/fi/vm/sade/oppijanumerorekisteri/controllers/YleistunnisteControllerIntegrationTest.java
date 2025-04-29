package fi.vm.sade.oppijanumerorekisteri.controllers;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static fi.vm.sade.oppijanumerorekisteri.controllers.YleistunnisteController.REQUEST_MAPPING;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.YLEISTUNNISTE_LUONTI_ACCESS_RIGHT;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@Sql("/sql/truncate_data.sql")
@Sql("/controller/yleistunniste/integration/fixture.sql")
@AutoConfigureMockMvc
class YleistunnisteControllerIntegrationTest {

    private final String BASE_PATH = REQUEST_MAPPING;

    @Autowired
    private MockMvc mvc;

    @Value("${dev.username}")
    private String username;

    @Value("${dev.password}")
    private String password;

    @Test
    void requiresAuthentication() throws Exception {
        // Redirect to CAS login
        mvc.perform(get(BASE_PATH + "/hae/1.2.3.4.5")).andExpect(status().isFound());
    }

    @Test
    void requiresAuthorization() throws Exception {
        mvc.perform(get(BASE_PATH + "/hae/1.2.3.4.5").with(user(username).password(password)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void notFound() throws Exception {
        mvc.perform(get(BASE_PATH + "/hae/invalid-oid").with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT)))
                .andExpect(status().isNotFound());
    }

    @Test
    void findMaster() throws Exception {
        mvc.perform(get(BASE_PATH + "/hae/master").with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT)))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.oid").value("master"),
                        jsonPath("$.oppijanumero").value("master"),
                        jsonPath("$.passivoitu").value(false),
                        jsonPath("$.linked", Matchers.hasSize(2)),
                        jsonPath("$.linked", Matchers.containsInAnyOrder("duplicate1", "duplicate2"))
                );
    }

    @Test
    void findDuplicate() throws Exception {
        mvc.perform(get(BASE_PATH + "/hae/duplicate1").with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT)))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.oid").value("duplicate1"),
                        jsonPath("$.oppijanumero").value("master"),
                        jsonPath("$.passivoitu").value(true),
                        jsonPath("$.linked", Matchers.hasSize(2)),
                        jsonPath("$.linked", Matchers.containsInAnyOrder("master", "duplicate2"))
                );
    }

    @Test
    void findYksiloimaton() throws Exception {
        mvc.perform(get(BASE_PATH + "/hae/yksiloimaton").with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT)))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.oid").value("yksiloimaton"),
                        jsonPath("$.oppijanumero", Matchers.nullValue()),
                        jsonPath("$.passivoitu").value(false),
                        jsonPath("$.linked", Matchers.empty())
                );
    }

    @Test
    void findYksiloity() throws Exception {
        mvc.perform(get(BASE_PATH + "/hae/yksiloity").with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT)))
                .andExpectAll(
                        status().isOk(),
                        jsonPath("$.oid").value("yksiloity"),
                        jsonPath("$.oppijanumero").value("yksiloity"),
                        jsonPath("$.passivoitu").value(false),
                        jsonPath("$.linked", Matchers.empty())
                );
    }
}
