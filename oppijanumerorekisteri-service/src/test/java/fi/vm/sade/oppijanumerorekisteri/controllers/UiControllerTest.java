package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijahakuCriteria;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROLE_OPPIJANUMEROREKISTERI_PREFIX;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROOT_ORGANISATION_SUFFIX;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Sql("/sql/truncate_data.sql")
@Sql("/controller/oppija/integration/fixture/ui-controller-test.sql")
@SpringBootTest
@AutoConfigureMockMvc
class UiControllerTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${dev.username}")
    private String username;

    @Value("${dev.password}")
    private String password;

    @MockitoBean
    PermissionChecker permissionChecker;

    final String ophVirkailijaRole = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX;

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

    @Test
    @WithMockUser(username = "1.2.3.4.5")
    void oppijahakuReturnsUnauthorizedWithMissingRole() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("jari", false, 0);
        mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", authorities = ophVirkailijaRole)
    void oppijahakuReturnsOppijasReturnsErrorForTooShortQuery() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("tu", false, 0);
        mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", authorities = ophVirkailijaRole)
    void oppijahakuReturnsOppijas() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("Tuonti", false, 0);
        var result = mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result).contains("""
            "content":[{"oid":"1.2.3.4.6","etunimet":"tuontietu1","sukunimi":"tuontisuku1","syntymaaika":"1963-09-12"},{"oid":"1.2.3.4.77","etunimet":"tuontietu2","sukunimi":"tuontisuku2","syntymaaika":"1998-11-14"}]""");
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", authorities = ophVirkailijaRole)
    void oppijahakuReturnsPassiveOppijas() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("tuontiEtu1", true, 0);
        var result = mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result).contains("""
            "content":[{"oid":"1.2.3.4.6","etunimet":"tuontietu1","sukunimi":"tuontisuku1","syntymaaika":"1963-09-12"},{"oid":"1.2.3.4.888","etunimet":"tuontietu1","sukunimi":"tuontisuku3","syntymaaika":"1977-07-07"}]""");
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", authorities = ophVirkailijaRole)
    void oppijahakuReturnsOppijasWithHenkiloUiFormattedQuery() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("TUONTISUKU1, tuonti", false, 0);
        var result = mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result).contains("""
            "content":[{"oid":"1.2.3.4.6","etunimet":"tuontietu1","sukunimi":"tuontisuku1","syntymaaika":"1963-09-12"}]""");
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", authorities = ophVirkailijaRole)
    void oppijahakuReturnsOppijasWithNameFormattedQuery() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("tuontietu1 TUONTI", false, 0);
        var result = mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result).contains("""
            "content":[{"oid":"1.2.3.4.6","etunimet":"tuontietu1","sukunimi":"tuontisuku1","syntymaaika":"1963-09-12"}]""");
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", authorities = ophVirkailijaRole)
    void oppijahakuReturnsOppijaWithHetu() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("120963-969H", false, 0);
        var result = mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result).contains("""
            "content":[{"oid":"1.2.3.4.6","etunimet":"tuontietu1","sukunimi":"tuontisuku1","syntymaaika":"1963-09-12"}]""");
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", authorities = ophVirkailijaRole)
    void oppijahakuReturnsOppijaWithOid() throws Exception {
        var oppijahakuCriteria = new OppijahakuCriteria("1.2.3.4.6", false, 0);
        var result = mvc.perform(post("/internal/oppijahaku")
                        .content(objectMapper.writeValueAsString(oppijahakuCriteria))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result).contains("""
            "content":[{"oid":"1.2.3.4.6","etunimet":"tuontietu1","sukunimi":"tuontisuku1","syntymaaika":"1963-09-12"}]""");
    }
}
