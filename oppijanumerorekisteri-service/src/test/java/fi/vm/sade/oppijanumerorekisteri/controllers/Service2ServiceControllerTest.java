package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import javax.validation.ConstraintViolationException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;

import static fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper.created;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROLE_OPPIJANUMEROREKISTERI_PREFIX;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("dev")
@RunWith(SpringRunner.class)
@WebMvcTest(Service2ServiceController.class)
@ContextConfiguration(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, PermissionCheckerImpl.class, UserDetailsHelperImpl.class})
public class Service2ServiceControllerTest  {
    @Autowired
    private MockMvc mvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HenkiloService henkiloService;

    @MockBean
    private HenkiloModificationService henkiloModificationService;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private OrganisaatioRepository organisaatioRepository;

    @MockBean
    private OrganisaatioService organisaatioService;


    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void getOidByHetuTest() throws Exception{
        given(this.henkiloService.getOidByHetu("123456-9999")).willReturn("1.2.3.4.5");
        this.mvc.perform(get("/s2s/oidByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findDuplicateHenkilosAllowedForRekisterinpitaja() throws Exception {
        findDuplicateHenkilosTest();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "DUPLICATE_READ")
    public void findDuplicateHenkilosAllowedWithCorrespondingPrivilege() throws Exception {
        findDuplicateHenkilosTest();
    }

    private void findDuplicateHenkilosTest() throws Exception {
        given(this.henkiloService.findHenkiloViittees(any())).willReturn(singletonList(new HenkiloViiteDto("CHILD","MASTER")));
        this.mvc.perform(post("/s2s/duplicateHenkilos")
                .with(csrf())
                .content("{}")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[{\"henkiloOid\": \"CHILD\", \"masterOid\": \"MASTER\"}]"));
        this.mvc.perform(post("/s2s/duplicateHenkilos").content("{\"henkiloOids\": [\"CHILD\"]}")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[{\"henkiloOid\": \"CHILD\", \"masterOid\": \"MASTER\"}]"));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findChangedPersonsGet() throws Exception {
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(singletonList("1.2.3"));
        this.mvc.perform(get("/s2s/changedSince/2015-10-12T10:10:10")
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[\"1.2.3\"]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), new DateTime(2015,10,12,10,10,10), null, null);

        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(emptyList());
        this.mvc.perform(get("/s2s/changedSince/2015-10-12")
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), new DateTime(2015,10,12,0,0,0), null, null);
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findChangedPersonsGetByTimestamp() throws Exception {
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(emptyList());
        DateTime dt = new DateTime(2015,10,12,0,0,0);
        this.mvc.perform(get("/s2s/changedSince/" + dt.toDate().getTime())
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), dt, null, null);
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findChangedPersonsPost() throws Exception {
        HenkiloCriteria criteria = HenkiloCriteria.builder().henkiloOids(new HashSet<>(singletonList("1.2.3"))).build();
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any(), any(), any())).willReturn(singletonList("1.2.3"));
        this.mvc.perform(post("/s2s/changedSince/2015-10-12T10:10:10").content("{\"henkiloOids\": [\"1.2.3\"]}")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[\"1.2.3\"]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(criteria, new DateTime(2015,10,12,10,10,10), null, null);
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findOrCreateNewHenkilo() throws Exception {
        this.objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        HenkiloPerustietoDto henkiloPerustietoDto = HenkiloPerustietoDto.builder().etunimet("arpa").kutsumanimi("arpa").sukunimi("kuutio")
                .hetu("081296-967T").oidHenkilo("1.2.3.4.5").build();
        String inputContent = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"," +
                "\"henkiloTyyppi\": \"VIRKAILIJA\"}";
        given(this.henkiloModificationService.findOrCreateHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willReturn(created(henkiloPerustietoDto));
        this.mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isCreated())
                .andExpect(content().json(this.objectMapper.writeValueAsString(henkiloPerustietoDto)));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findOrCreateHenkiloConstraintViolationExceptionBadHenkiloTyyppi() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"}";
        given(this.henkiloModificationService.findOrCreateHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willThrow(new ConstraintViolationException("message", null));
        this.mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findOrCreateHenkiloDataIntegrityViolationException() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"," +
                "\"henkiloTyyppi\": \"VIRKAILIJA\"}";
        given(this.henkiloModificationService.findOrCreateHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willThrow(new DataIntegrityViolationException("message"));
        this.mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(content)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findOrCreateHenkiloShouldWorkWithoutHetu() throws Exception {
        this.objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        HenkiloPerustietoDto henkiloPerustietoDto = HenkiloPerustietoDto.builder()
                .etunimet("arpa").kutsumanimi("arpa").sukunimi("kuutio")
                .build();
        String inputContent = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"henkiloTyyppi\": \"VIRKAILIJA\"}";
        given(this.henkiloModificationService.findOrCreateHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willReturn(created(henkiloPerustietoDto));
        this.mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isCreated())
                .andExpect(content().json(this.objectMapper.writeValueAsString(henkiloPerustietoDto)));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findOrCreateMultipleValid() throws Exception {
        String inputContent = "[{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"}]";
        this.mvc.perform(post("/s2s/henkilo/findOrCreateMultiple")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());
        verify(henkiloModificationService).findOrCreateHenkiloFromPerustietoDto(anyList());
    }

    @Test
    @WithMockUser
    public void findOrCreateMultipleInvalid() throws Exception {
        String inputContent = "[{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"olematon_hetu\"}]";
        this.mvc.perform(post("/s2s/henkilo/findOrCreateMultiple")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(henkiloModificationService);
    }

    @Test
    @WithMockUser
    public void findOrCreateMultipleExternalIdsInvalid() throws Exception {
        String inputContent = "[{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"externalIds\": [\" \"]," +
                "\"hetu\": \"081296-967T\"}]";
        this.mvc.perform(post("/s2s/henkilo/findOrCreateMultiple")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(henkiloModificationService);
    }

    @Test
    @WithMockUser
    public void findOrCreateMultipleIdenfiticationNull() throws Exception {
        String inputContent = "[{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"identifications\": [null]," +
                "\"hetu\": \"081296-967T\"}]";
        this.mvc.perform(post("/s2s/henkilo/findOrCreateMultiple")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(henkiloModificationService);
    }

    @Test
    @WithMockUser
    public void findOrCreateMultipleIdenfiticationEmpty() throws Exception {
        String inputContent = "[{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"identifications\": [{}]," +
                "\"hetu\": \"081296-967T\"}]";
        this.mvc.perform(post("/s2s/henkilo/findOrCreateMultiple")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(henkiloModificationService);
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void getHenkiloYhteystiedot() throws Exception {
        String content = "{\"yhteystietotyyppi2\":" +
                "{\"sahkoposti\":\"testi@tyo.com\"}," +
                "\"yhteystietotyyppi7\":{\"katuosoite\":\"katu 134\"}, " + "" +
                "\"yhteystietotyyppi1\":{\"sahkoposti\":\"testi@test.com\"}}";

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5")).willReturn(new HenkilonYhteystiedotViewDto()
                .put("yhteystietotyyppi7", YhteystiedotDto.builder().katuosoite("katu 134").build())
                .put("yhteystietotyyppi2", YhteystiedotDto.builder().sahkoposti("testi@tyo.com").build())
                .put("yhteystietotyyppi1", YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/s2s/yhteystiedot/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(content));

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.6")).willReturn(new HenkilonYhteystiedotViewDto());
        this.mvc.perform(get("/s2s/yhteystiedot/1.2.3.4.6").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("{}"));
    }

    @Test
    public void findByMunicipalAndDobNoAuth() throws Exception {
        this.mvc.perform(get("/s2s/henkilo/list/foo/2021-11-05").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findByMunicipalAndDob() throws Exception {
        given(henkiloService.findByMunicipalAndBirthdate("foo", LocalDate.of(2021, 11, 5), 1))
                .willReturn(Slice.of(1, 0, Collections.EMPTY_LIST));
        mvc.perform(get("/s2s/henkilo/list/foo/2021-11-05").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"number\":1,\"size\":0,\"results\":[],\"last\":true,\"first\":true,\"numberOfElements\":0}"));
        verify(henkiloService).findByMunicipalAndBirthdate("foo", LocalDate.of(2021, 11, 5), 1);
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findByMunicipalAndDobIncorrectPage() throws Exception {
        mvc.perform(get("/s2s/henkilo/list/foo/2021-11-05?page=0").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void findByMunicipalAndDobIncorrectDate() throws Exception {
        mvc.perform(get("/s2s/henkilo/list/foo/juhannus").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }
}
