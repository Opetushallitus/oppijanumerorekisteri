package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.auditlog.Target;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.audit.OnrOperation;
import fi.vm.sade.oppijanumerorekisteri.audit.VirkailijaAuditLogger;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.skyscreamer.jsonassert.Customization;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.skyscreamer.jsonassert.comparator.CustomComparator;
import org.skyscreamer.jsonassert.comparator.JSONComparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("dev")
@Sql("/sql/truncate_data.sql")
@Sql("/sql/henkilo-controller-test.sql")
@SpringBootTest
@AutoConfigureMockMvc
public class HenkiloControllerUnmockedTest {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    PermissionChecker permissionChecker;
    @Captor
    ArgumentCaptor<Target> auditCaptor;
    @MockitoBean
    private VirkailijaAuditLogger auditLogger;

    private final JSONComparator comparator = new CustomComparator(JSONCompareMode.NON_EXTENSIBLE,
            new Customization("**.modified", (o1, o2) -> true),
            new Customization("**.modifiedAt", (o1, o2) -> true),
            new Customization("**.created", (o1, o2) -> true),
            new Customization("**.createdAt", (o1, o2) -> true));

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    void henkilotByHenkiloOidList() throws Exception {
        given(permissionChecker.filterUnpermittedHenkiloPerustieto(any(), any(), any())).will(i -> i.getArguments()[0]);

        var result = mvc.perform(post("/henkilo/henkiloPerustietosByHenkiloOidList")
                        .content("""
["1.2.3.4.5", "1.2.3.4.6"]""")
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/henkilo/henkilot.json"), result, comparator);
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    void henkilotByHenkiloHetuList() throws Exception {
        given(permissionChecker.filterUnpermittedHenkiloPerustieto(any(), any(), any())).will(i -> i.getArguments()[0]);

        var result = mvc.perform(post("/henkilo/henkiloPerustietosByHenkiloHetuList")
                        .content("""
["111111-985K", "111111-1234"]""")
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/henkilo/henkilot.json"), result, comparator);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void henkiloOidHetuNimiByHetu() throws Exception {
        String content = """
{
        "etunimet": "Teppo Taneli",
        "kutsumanimi": "Teppo",
        "sukunimi": "Testaaja",
        "hetu": "111111-985K",
        "oidHenkilo": "1.2.3.4.5"
}""";
        mvc.perform(get("/henkilo/henkiloPerusByHetu/111111-985K")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(content));
        verifyReadAudit("1.2.3.4.5");
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void masterHenkilosByOidList() throws Exception {
        given(permissionChecker.filterUnpermittedHenkiloMap(any(), any(), any())).will(i -> i.getArguments()[0]);

        String result = mvc.perform(post("/henkilo/masterHenkilosByOidList")
                .content("""
["1.2.3.4.6", "1.2.3.4.5"]""")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JSONAssert.assertEquals(FilesystemHelper.getFixture("/controller/henkilo/masterHenkilosByOidList.json"), result, comparator);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void henkiloOidHetuNimiByHetuNotFound() throws Exception {
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/081296-967T")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        verifyReadNoAudit();
    }

    private void verifyReadAudit(String expected) {
        verify(auditLogger).log(eq(OnrOperation.READ), auditCaptor.capture(), any());
        assertThat(auditCaptor.getValue().asJson().toString()).contains(expected);
    }

    private void verifyReadNoAudit() {
        verify(auditLogger, never()).log(eq(OnrOperation.READ), any(), any());
    }
}
