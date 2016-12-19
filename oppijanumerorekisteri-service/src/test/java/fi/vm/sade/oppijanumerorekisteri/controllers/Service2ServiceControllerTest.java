package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHetuAndOidDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import javax.validation.ConstraintViolationException;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;

import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(Service2ServiceController.class)
public class Service2ServiceControllerTest  {
    @Autowired
    private MockMvc mvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HenkiloService henkiloService;

    @Test
    @WithMockUser
    public void getOidByHetuTest() throws Exception{
        given(this.henkiloService.getOidByHetu("123456-9999")).willReturn("1.2.3.4.5");
        this.mvc.perform(get("/s2s/oidByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser
    public void getHetusAndOidsTest() throws Exception{
        given(this.henkiloService.getHetusAndOids(null, 0, 100)).willReturn(Arrays.asList(
                new HenkiloHetuAndOidDto("0.0.0.0.1", "111111-111", new Date(1420063200000L)),
                new HenkiloHetuAndOidDto("0.0.0.0.2", "111111-112", new Date(0L)),
                new HenkiloHetuAndOidDto("0.0.0.0.3", "111111-113", new Date(0L))));
        this.mvc.perform(get("/s2s/hetusAndOids?sinceVtjUpdated=-1").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json("[\n" +
                        "  {\n" +
                        "    \"oidHenkilo\": \"0.0.0.0.1\",\n" +
                        "    \"hetu\": \"111111-111\",\n" +
                        "    \"vtjsynced\": 1420063200000\n" +
                        "  },\n" +
                        "  {\n" +
                        "    \"oidHenkilo\": \"0.0.0.0.2\",\n" +
                        "    \"hetu\": \"111111-112\",\n" +
                        "    \"vtjsynced\": 0\n" +
                        "  },\n" +
                        "  {\n" +
                        "    \"oidHenkilo\": \"0.0.0.0.3\",\n" +
                        "    \"hetu\": \"111111-113\",\n" +
                        "    \"vtjsynced\": 0\n" +
                        "  }\n" +
                        "]"));
    }
    
    @Test
    @WithMockUser
    public void findDuplicateHenkilosTest() throws Exception {
        given(this.henkiloService.findHenkiloViittees(any())).willReturn(singletonList(new HenkiloViiteDto("CHILD","MASTER")));
        this.mvc.perform(post("/s2s/duplicateHenkilos").content("{}")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[{\"henkiloOid\": \"CHILD\", \"masterOid\": \"MASTER\"}]"));
        this.mvc.perform(post("/s2s/duplicateHenkilos").content("{\"henkiloOids\": [\"CHILD\"]}")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[{\"henkiloOid\": \"CHILD\", \"masterOid\": \"MASTER\"}]"));
    }

    @Test
    @WithMockUser
    public void findChangedPersonsGet() throws Exception {
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any())).willReturn(singletonList("1.2.3"));
        this.mvc.perform(get("/s2s/changedSince/2015-10-12T10:10:10")
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[\"1.2.3\"]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), new DateTime(2015,10,12,10,10,10));
        
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any())).willReturn(emptyList());
        this.mvc.perform(get("/s2s/changedSince/2015-10-12")
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), new DateTime(2015,10,12,0,0,0));
    }
    
    @Test
    @WithMockUser
    public void findChangedPersonsGetByTimestamp() throws Exception {
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any())).willReturn(emptyList());
        DateTime dt = new DateTime(2015,10,12,0,0,0);
        this.mvc.perform(get("/s2s/changedSince/" + dt.toDate().getTime())
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(new HenkiloCriteria(), dt);
    }

    @Test
    @WithMockUser
    public void findChangedPersonsPost() throws Exception {
        HenkiloCriteria criteria = HenkiloCriteria.builder().henkiloOids(new HashSet<>(singletonList("1.2.3"))).build();
        given(this.henkiloService.findHenkiloOidsModifiedSince(any(), any())).willReturn(singletonList("1.2.3"));
        this.mvc.perform(post("/s2s/changedSince/2015-10-12T10:10:10").content("{\"henkiloOids\": [\"1.2.3\"]}")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content()
                .json("[\"1.2.3\"]"));
        verify(this.henkiloService).findHenkiloOidsModifiedSince(criteria, new DateTime(2015,10,12,10,10,10));
    }

    @Test
    @WithMockUser
    public void findOrCreateNewHenkilo() throws Exception {
        this.objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        HenkiloPerustietoDto henkiloPerustietoDto = HenkiloPerustietoDto.builder().etunimet("arpa").kutsumanimi("arpa").sukunimi("kuutio")
                .hetu("081296-967T").oidHenkilo("1.2.3.4.5").henkiloTyyppi(HenkiloTyyppi.VIRKAILIJA).createdOnService(true).build();
        String inputContent = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"," +
                "\"henkiloTyyppi\": \"VIRKAILIJA\"}";
        given(this.henkiloService.findOrCreateHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willReturn(henkiloPerustietoDto);
        this.mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isCreated())
                .andExpect(content().json(this.objectMapper.writeValueAsString(henkiloPerustietoDto)));
    }

    @Test
    @WithMockUser
    public void findOrCreateHenkiloConstraintViolationExceptionBadHenkiloTyyppi() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"}";
        given(this.henkiloService.findOrCreateHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willThrow(new ConstraintViolationException("message", null));
        this.mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason("bad_request_method_argument"));
    }

    @Test
    @WithMockUser
    public void findOrCreateHenkiloDataIntegrityViolationException() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"," +
                "\"henkiloTyyppi\": \"VIRKAILIJA\"}";
        given(this.henkiloService.findOrCreateHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willThrow(new DataIntegrityViolationException("message"));
        this.mvc.perform(post("/s2s/findOrCreateHenkiloPerustieto").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason("bad_request_persistence"));
    }


}
