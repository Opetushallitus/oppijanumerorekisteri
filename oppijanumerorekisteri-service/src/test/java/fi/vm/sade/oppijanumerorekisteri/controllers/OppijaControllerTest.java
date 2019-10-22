package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.KoodiUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROLE_OPPIJANUMEROREKISTERI_PREFIX;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptySet;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("dev")
@RunWith(SpringRunner.class)
@WebMvcTest(OppijaController.class)
@ContextConfiguration(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, PermissionCheckerImpl.class, UserDetailsHelperImpl.class})
public class OppijaControllerTest {

    @MockBean
    private OppijaService oppijaServiceMock;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private OrganisaatioRepository organisaatioRepository;

    @MockBean
    private OrganisaatioService organisaatioService;

    private OppijaTuontiCreateDto getValidOppijatCreateDto() {
        return OppijaTuontiCreateDto.builder()
                .sahkoposti("example@example.com")
                .henkilot(Stream.of(getValidOppijaCreateDto()).collect(toList()))
                .build();
    }

    private OppijaTuontiRiviCreateDto getValidOppijaCreateDto() {
        return OppijaTuontiRiviCreateDto.builder()
                .tunniste("henkilo1")
                .henkilo(getValidHenkiloCreateDto())
                .build();
    }

    private OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto getValidHenkiloCreateDto() {
        return OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                .hetu("170897-935L")
                .etunimet("etu")
                .kutsumanimi("etu")
                .sukunimi("suku")
                .kansalaisuus(Stream.of("kansalaisuus1").map(KoodiUpdateDto::new).collect(toSet()))
                .build();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void putOppijaShouldWork() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(oppijaServiceMock).create(any(OppijaTuontiCreateDto.class));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void putOppijaShouldWorkWithoutSahkoposti() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        dto.setSahkoposti(null);

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(oppijaServiceMock).create(any(OppijaTuontiCreateDto.class));
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldValidateSahkoposti() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        dto.setSahkoposti("lsdkjd");

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireHenkilot() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        dto.setHenkilot(null);

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldContainHenkilot() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        dto.setHenkilot(emptyList());

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldValidateHetu() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setHetu("hetu1");
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromNull() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(null);
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromEmpty() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(emptySet());
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromNullDto() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(Stream.of((KoodiUpdateDto) null).collect(toSet()));
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromNullKoodi() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(Stream.of((String) null).map(KoodiUpdateDto::new).collect(toSet()));
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldValidateHenkilo() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setOid(null);
        oppijaCreateDto.getHenkilo().setHetu(null);
        oppijaCreateDto.getHenkilo().setPassinumero(null);
        oppijaCreateDto.getHenkilo().setSahkoposti(null);
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put("/oppija")
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyZeroInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void getOppijaShouldValidatePageParameter() throws Exception {
        mvc.perform(get("/oppija?page=1")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        mvc.perform(get("/oppija?page=0")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

}
