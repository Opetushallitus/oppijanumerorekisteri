package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHetuAndOidDto;
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

import java.util.Arrays;
import java.util.Date;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(Service2ServiceController.class)
public class Service2ServiceControllerTest  {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private HenkiloService service;

    @Test
    @WithMockUser
    public void getOidByHetuTest() throws Exception{
        given(this.service.getOidByHetu("123456-9999")).willReturn("1.2.3.4.5");
        this.mvc.perform(get("/s2s/oidByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser
    public void oidExistsTest() throws Exception{
        given(this.service.getOidExists("1.2.3.4.5")).willReturn(true);
        this.mvc.perform(get("/s2s/oidExists/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("true"));
    }

    @Test
    @WithMockUser
    public void getHetusAndOidsTest() throws Exception{
        given(this.service.getHetusAndOids(null, 0, 100)).willReturn(Arrays.asList(
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

}
