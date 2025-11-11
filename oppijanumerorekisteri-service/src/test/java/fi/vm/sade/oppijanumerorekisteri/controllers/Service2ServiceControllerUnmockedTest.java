package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.clients.HenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("dev")
@Sql("/sql/truncate_data.sql")
@Sql("/sql/henkilo-controller-test.sql")
@SpringBootTest
@AutoConfigureMockMvc
public class Service2ServiceControllerUnmockedTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private HenkiloModifiedTopic henkiloModifiedTopic;

    private final JSONComparator henkiloPerustietoComparator = new CustomComparator(JSONCompareMode.NON_EXTENSIBLE,
            new Customization("modified", (o1, o2) -> true),
            new Customization("modifiedAt", (o1, o2) -> true));

    private final JSONComparator henkiloDtoComparator = new CustomComparator(JSONCompareMode.NON_EXTENSIBLE,
            new Customization("oidHenkilo", (o1, o2) -> true),
            new Customization("oppijanumero", (o1, o2) -> true),
            new Customization("created", (o1, o2) -> true),
            new Customization("createdAt", (o1, o2) -> true),
            new Customization("modified", (o1, o2) -> true),
            new Customization("modifiedAt", (o1, o2) -> true));

    @BeforeEach
    public void beforeEach() {
        doNothing().when(henkiloModifiedTopic).publish(any());
    }

    @Test
    @WithMockUser(
        username = "1.2.3.4.5",
        roles = {"APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA"}
    )
    public void findOrCreateHenkiloFindsByEidasTunniste() throws Exception {
        String content = """
{
        "etunimet": "Tepo",
        "sukunimi": "Tulpu",
        "kutsumanimi": "Tepo",
        "eidasTunniste": "FOO/BAR/QUUX"
}""";
        String result = mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JSONAssert.assertEquals("""
{
        "oidHenkilo": "1.2.3.4.5",
        "externalIds": [],
        "identifications": [],
        "hetu": "111111-985K",
        "eidasTunnisteet": [{"tunniste":"FOO/BAR/BAZ"},{"tunniste":"FOO/BAR/QUUX"}],
        "etunimet": "Teppo Taneli",
        "kutsumanimi": "Teppo",
        "sukunimi": "Testaaja",
        "syntymaaika": null,
        "turvakielto": false,
        "aidinkieli": {"kieliKoodi":"fi","kieliTyyppi":"suomi"},
        "asiointiKieli": {"kieliKoodi":"fi","kieliTyyppi":"suomi"},
        "kansalaisuus": [{"kansalaisuusKoodi":"504"},{"kansalaisuusKoodi":"246"}],
        "sukupuoli": null,
        "modified": 1762770284299,
        "modifiedAt": "2025-11-10T12:24:44.299+02:00"
}""", result, henkiloPerustietoComparator);
    }

    @Test
    @WithMockUser(
        username = "1.2.3.4.5",
        roles = {"APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA"}
    )
    public void findOrCreateHenkiloCreatesWithHetu() throws Exception {
        String content = """
{
        "etunimet": "Tepo",
        "sukunimi": "Tulpu",
        "kutsumanimi": "Tepo",
        "hetu": "010107A9574"
}""";
        String created = mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        HenkiloPerustietoDto oid = objectMapper.readValue(created, HenkiloPerustietoDto.class);

        String result = mvc.perform(get("/henkilo/" + oid.getOidHenkilo())
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JSONAssert.assertEquals("""
{
        "oidHenkilo":"1.2.246.562.24.96541910472",
        "hetu":"010107A9574",
        "kaikkiHetut":[],
        "passivoitu":false,
        "etunimet":"Tepo",
        "kutsumanimi":"Tepo",
        "sukunimi":"Tulpu",
        "aidinkieli":null,
        "asiointiKieli":null,
        "kansalaisuus":[],
        "kasittelijaOid":"1.2.3.4.5",
        "syntymaaika":"2007-01-01",
        "sukupuoli":"1",
        "kotikunta":null,
        "oppijanumero":null,
        "turvakielto":false,
        "eiSuomalaistaHetua":false,
        "yksiloity":false,
        "yksiloityVTJ":false,
        "yksilointiYritetty":false,
        "yksiloityEidas":false,
        "eidasTunnisteet":[],
        "duplicate":false,
        "vtjsynced":null,
        "yhteystiedotRyhma":[],
        "yksilointivirheet":[],
        "passinumerot":[],
        "kielisyys":[],
        "created": null,
        "createdAt": null,
        "modified": null,
        "modifiedAt": null
}""", result, henkiloDtoComparator);
    }

    @Test
    @WithMockUser(
        username = "1.2.3.4.5",
        roles = {"APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA", "APP_OPPIJANUMEROREKISTERI_EIDAS_HENKILON_LUONTI"}
    )
    public void findOrCreateHenkiloCreatesWithEidas() throws Exception {
        String content = """
{
        "etunimet": "Tepo",
        "sukunimi": "Tulpu",
        "kutsumanimi": "Tepo",
        "eidasTunniste": "FOO/BAR/123"
}""";
        String created = mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        HenkiloPerustietoDto oid = objectMapper.readValue(created, HenkiloPerustietoDto.class);

        String result = mvc.perform(get("/henkilo/" + oid.getOidHenkilo())
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JSONAssert.assertEquals("""
{
        "oidHenkilo":"1.2.246.562.24.96541910472",
        "hetu":null,
        "kaikkiHetut":[],
        "passivoitu":false,
        "etunimet":"Tepo",
        "kutsumanimi":"Tepo",
        "sukunimi":"Tulpu",
        "aidinkieli":null,
        "asiointiKieli":null,
        "kansalaisuus":[],
        "kasittelijaOid":"1.2.3.4.5",
        "syntymaaika":null,
        "sukupuoli":null,
        "kotikunta":null,
        "oppijanumero":null,
        "turvakielto":false,
        "eiSuomalaistaHetua":false,
        "yksiloity":false,
        "yksiloityVTJ":false,
        "yksilointiYritetty":false,
        "yksiloityEidas":true,
        "eidasTunnisteet":[{"tunniste":"FOO/BAR/123"}],
        "duplicate":false,
        "vtjsynced":null,
        "yhteystiedotRyhma":[],
        "yksilointivirheet":[],
        "passinumerot":[],
        "kielisyys":[],
        "created": null,
        "createdAt": null,
        "modified": null,
        "modifiedAt": null
}""", result, henkiloDtoComparator);
    }

    @Test
    @WithMockUser(
        username = "1.2.3.4.5",
        roles = {"APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA", "APP_OPPIJANUMEROREKISTERI_EIDAS_HENKILON_LUONTI"}
    )
    public void findOrCreateHenkiloFailsWithBothHetuAndEidas() throws Exception {
        String content = """
{
        "etunimet": "Tepo",
        "sukunimi": "Tulpu",
        "kutsumanimi": "Tepo",
        "hetu": "010107A9917",
        "eidasTunniste": "FOO/BAR/123"
}""";
        String result = mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result).contains("Cannot findOrCreate henkilo with both hetu and eidasTunniste");
    }

    @Test
    @WithMockUser(
        username = "1.2.3.4.5",
        roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA"
    )
    public void findOrCreateHenkiloFailsWhenCreatingEidasHenkiloWithoutRole() throws Exception {
        String content = """
{
        "etunimet": "Tepo",
        "sukunimi": "Tulpu",
        "kutsumanimi": "Tepo",
        "eidasTunniste": "FOO/BAR/123"
}""";
        mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());;
    }

    @Test
    @WithMockUser(
        username = "1.2.3.4.5",
        roles = {"APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA", "APP_OPPIJANUMEROREKISTERI_EIDAS_HENKILON_LUONTI"}
    )
    public void findOrCreateHenkiloReturnsNotFoundOnMissingOid() throws Exception {
        String content = """
{
        "oidHenkilo": "5.4.3.2.1",
        "etunimet": "Tepo",
        "sukunimi": "Tulpu",
        "kutsumanimi": "Tepo"
}""";
        mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
