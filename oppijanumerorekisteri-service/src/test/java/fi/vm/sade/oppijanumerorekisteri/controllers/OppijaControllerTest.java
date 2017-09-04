package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toSet;
import java.util.stream.Stream;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(OppijaController.class)
@ContextConfiguration(classes = OppijanumerorekisteriServiceApplication.class)
public class OppijaControllerTest {

    @MockBean
    private OppijaService oppijaServiceMock;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    private OppijatCreateDto getValidOppijatCreateDto() {
        return OppijatCreateDto.builder()
                .sahkoposti("example@example.com")
                .henkilot(Stream.of(getValidOppijaCreateDto()).collect(toSet()))
                .build();
    }

    private OppijaCreateDto getValidOppijaCreateDto() {
        return OppijaCreateDto.builder()
                .tunniste("henkilo1")
                .henkilo(getValidHenkiloCreateDto())
                .build();
    }

    private OppijaCreateDto.HenkiloCreateDto getValidHenkiloCreateDto() {
        return OppijaCreateDto.HenkiloCreateDto.builder()
                .hetu("170897-935L")
                .etunimet("etu")
                .kutsumanimi("etu")
                .sukunimi("suku")
                .build();
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldWork() throws Exception {
        OppijatCreateDto dto = getValidOppijatCreateDto();

        mvc.perform(put("/oppija")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(oppijaServiceMock).getOrCreate(any());
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldWorkWithoutSahkoposti() throws Exception {
        OppijatCreateDto dto = getValidOppijatCreateDto();
        dto.setSahkoposti(null);

        mvc.perform(put("/oppija")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(oppijaServiceMock).getOrCreate(any());
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldValidateSahkoposti() throws Exception {
        OppijatCreateDto dto = getValidOppijatCreateDto();
        dto.setSahkoposti("lsdkjd");

        mvc.perform(put("/oppija")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireHenkilot() throws Exception {
        OppijatCreateDto dto = getValidOppijatCreateDto();
        dto.setHenkilot(null);

        mvc.perform(put("/oppija")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldContainHenkilot() throws Exception {
        OppijatCreateDto dto = getValidOppijatCreateDto();
        dto.setHenkilot(emptyList());

        mvc.perform(put("/oppija")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldValidateHetu() throws Exception {
        OppijatCreateDto dto = getValidOppijatCreateDto();
        OppijaCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setHetu(null);
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toSet()));

        mvc.perform(put("/oppija")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

}
