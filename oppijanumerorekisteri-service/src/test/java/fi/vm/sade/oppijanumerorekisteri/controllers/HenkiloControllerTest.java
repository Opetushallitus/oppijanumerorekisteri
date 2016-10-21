package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.AbstractTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.KOTIOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.TYOOSOITE;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
}
