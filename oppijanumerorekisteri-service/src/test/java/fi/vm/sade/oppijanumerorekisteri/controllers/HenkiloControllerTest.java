package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.AbstractTest;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
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

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.KOTIOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.TYOOSOITE;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.anyObject;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(HenkiloController.class)
public class HenkiloControllerTest extends AbstractTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private HenkiloService service;

    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void hasHetuTest() throws Exception {
        given(this.service.getHasHetu("1.2.3.4.5")).willReturn(true);
        this.mvc.perform(get("/henkilo/current/hasHetu").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("true"));
    }

    @Test
    @WithMockUser
    public void henkiloOidHetuNimiByHetu() throws Exception {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5");
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"," +
                "\"oidhenkilo\": \"1.2.3.4.5\"}";
        given(this.service.getHenkiloOidHetuNimiByHetu("123456-9999")).willReturn(henkiloOidHetuNimiDto);
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(content));
    }

    @Test
    @WithMockUser
    public void henkiloOidHetuNimiByHetuNotFound() throws Exception {
        given(this.service.getHenkiloOidHetuNimiByHetu("123456-9999")).willThrow(new NotFoundException());
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void createHenkiloTest() throws Exception {
        HenkiloKoskiDto henkiloKoskiDto = HenkiloKoskiDto.builder().etunimet("arpa").kutsumanimi("arpa").sukunimi("kuutio")
        .hetu("123456-9999").oidhenkilo("1.2.3.4.5").build();
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"," +
                "\"oidhenkilo\": \"1.2.3.4.5\"}";
        given(this.service.createHenkiloFromKoskiDto(anyObject())).willReturn(henkiloKoskiDto);
        this.mvc.perform(post("/henkilo/koskihenkilo").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isCreated()).andExpect(content().json(content));
    }

    @Test
    @WithMockUser
    public void createHenkiloConstraintViolationExceptionTest() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"}";
        given(this.service.createHenkiloFromKoskiDto(anyObject())).willThrow(new ConstraintViolationException("message", null));
        this.mvc.perform(post("/henkilo/koskihenkilo").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void createHenkiloDataIntegrityViolationExceptionTest() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"}";
        given(this.service.createHenkiloFromKoskiDto(anyObject())).willThrow(new DataIntegrityViolationException("message"));
        this.mvc.perform(post("/henkilo/koskihenkilo").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void createHenkiloNullHetuTest() throws Exception {
        HenkiloKoskiDto henkiloKoskiDto = HenkiloKoskiDto.builder().etunimet("arpa").kutsumanimi("arpa").sukunimi("kuutio")
                .oidhenkilo("1.2.3.4.5").build();
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"oidhenkilo\": \"1.2.3.4.5\"}";
        given(this.service.createHenkiloFromKoskiDto(anyObject())).willReturn(henkiloKoskiDto);
        this.mvc.perform(post("/henkilo/koskihenkilo").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void getHenkiloYhteystiedot() throws Exception {
        given(this.service.getHenkiloYhteystiedot("1.2.3.4.5")).willReturn(new HenkilonYhteystiedotViewDto()
            .put(YhteystietoRyhma.KOTIOSOITE, YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(jsonResource("classpath:henkilo/simpleTestYhteystiedot.json")));
        
        given(this.service.getHenkiloYhteystiedot("1.2.3.4.6")).willReturn(new HenkilonYhteystiedotViewDto());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("{}"));
    }
    
    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void getHenkiloYhteystiedotByRyhma() throws Exception {
        given(this.service.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE)).willReturn(
                of(YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/kotiosoite").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(jsonResource("classpath:henkilo/simpleYhteystieto.json")));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/yhteystietotyyppi1").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(jsonResource("classpath:henkilo/simpleYhteystieto.json")));

        given(this.service.getHenkiloYhteystiedot("1.2.3.4.5", TYOOSOITE)).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/tyoosoite").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
        
        given(this.service.getHenkiloYhteystiedot("1.2.3.4.6", KOTIOSOITE)).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot/kotiosoite").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
        
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/tuntematon_tyyppi").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"INAPPROPRIATE_ROLE"})
    public void unauthorizedTest() throws Exception {
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isForbidden());
    }
}
