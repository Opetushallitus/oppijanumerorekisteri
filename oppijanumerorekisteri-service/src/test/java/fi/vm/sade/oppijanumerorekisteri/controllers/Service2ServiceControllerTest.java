package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;

import org.joda.time.DateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;

import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class Service2ServiceControllerTest  {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private HenkiloService henkiloService;

    @MockitoBean
    private HenkiloModificationService henkiloModificationService;

    @MockitoBean
    private KayttooikeusClient kayttooikeusClient;

    @MockitoBean
    private OrganisaatioRepository organisaatioRepository;

    @MockitoBean
    private OrganisaatioService organisaatioService;

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void getOidByHetuTest() throws Exception{
        given(this.henkiloService.getOidByHetu("123456-9999")).willReturn("1.2.3.4.5");
        this.mvc.perform(get("/s2s/oidByHetu/123456-9999").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findDuplicateHenkilosAllowedForRekisterinpitaja() throws Exception {
        findDuplicateHenkilosTest();
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_DUPLICATE_READ")
    public void findDuplicateHenkilosAllowedWithCorrespondingPrivilege() throws Exception {
        findDuplicateHenkilosTest();
    }

    private void findDuplicateHenkilosTest() throws Exception {
        given(this.henkiloService.findHenkiloViittees(any())).willReturn(singletonList(new HenkiloViiteDto("CHILD","MASTER")));
        this.mvc.perform(post("/s2s/duplicateHenkilos")
                .with(csrf())
                .content("{}")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content()
                .json("[{\"henkiloOid\": \"CHILD\", \"masterOid\": \"MASTER\"}]"));
        this.mvc.perform(post("/s2s/duplicateHenkilos").content("{\"henkiloOids\": [\"CHILD\"]}")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content()
                .json("[{\"henkiloOid\": \"CHILD\", \"masterOid\": \"MASTER\"}]"));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findChangedPersonsGet() throws Exception {
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(singletonList("1.2.3"));
        this.mvc.perform(get("/s2s/changedSince/2015-10-12T10:10:10")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content()
                .json("[\"1.2.3\"]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), new DateTime(2015,10,12,10,10,10), null, null);

        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(emptyList());
        this.mvc.perform(get("/s2s/changedSince/2015-10-12")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), new DateTime(2015,10,12,0,0,0), null, null);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findChangedPersonsGetByTimestamp() throws Exception {
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(emptyList());
        DateTime dt = new DateTime(2015,10,12,0,0,0);
        this.mvc.perform(get("/s2s/changedSince/" + dt.toDate().getTime())
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), dt, null, null);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findChangedPersonsPost() throws Exception {
        HenkiloCriteria criteria = HenkiloCriteria.builder().henkiloOids(new HashSet<>(singletonList("1.2.3"))).build();
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(singletonList("1.2.3"));
        this.mvc.perform(post("/s2s/changedSince/2015-10-12T10:10:10").content("{\"henkiloOids\": [\"1.2.3\"]}")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content()
                .json("[\"1.2.3\"]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(criteria, new DateTime(2015,10,12,10,10,10), null, null);
    }

    @Test
    public void findByMunicipalAndDobNoAuth() throws Exception {
        this.mvc.perform(get("/s2s/henkilo/list/foo/2021-11-05").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("https://localhost/cas/login?service=http%3A%2F%2Flocalhost%2Foppijanumerorekisteri-service%2Fj_spring_cas_security_check"));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findByMunicipalAndDob() throws Exception {
        given(henkiloService.findByMunicipalAndBirthdate("foo", LocalDate.of(2021, 11, 5), 1))
                .willReturn(Slice.of(1, 0, Collections.emptyList()));
        mvc.perform(get("/s2s/henkilo/list/foo/2021-11-05").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"number\":1,\"size\":0,\"results\":[],\"last\":true,\"first\":true,\"numberOfElements\":0}"));
        verify(henkiloService).findByMunicipalAndBirthdate("foo", LocalDate.of(2021, 11, 5), 1);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findByMunicipalAndDobIncorrectPage() throws Exception {
        mvc.perform(get("/s2s/henkilo/list/foo/2021-11-05?page=0").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findByMunicipalAndDobIncorrectDate() throws Exception {
        mvc.perform(get("/s2s/henkilo/list/foo/juhannus").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
