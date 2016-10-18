package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.services.OppijanumerorekisteriBusinessService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(Service2ServiceController.class)
public class Service2ServiceControllerTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private OppijanumerorekisteriBusinessService service;

    @Test
    @WithMockUser
    public void getOidByHetu() throws Exception{
        given(this.service.getOidByHetu("123456-9999")).willReturn("1.2.3.4.5");
        this.mvc.perform(get("/s2s/oidByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser
    public void oidExists() throws Exception{
        given(this.service.getOidExists("1.2.3.4.5")).willReturn(true);
        this.mvc.perform(get("/s2s/oidExists/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("true"));
    }

}
