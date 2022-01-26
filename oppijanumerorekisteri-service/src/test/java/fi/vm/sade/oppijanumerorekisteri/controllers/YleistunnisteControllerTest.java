package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import org.junit.Ignore;
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

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.controllers.YleistunnisteController.REQUEST_MAPPING;
import static java.util.Collections.*;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.internal.verification.VerificationModeFactory.times;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Ignore
@ActiveProfiles("dev")
@RunWith(SpringRunner.class)
@WebMvcTest(YleistunnisteController.class)
@ContextConfiguration(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, PermissionCheckerImpl.class, UserDetailsHelperImpl.class})
public class YleistunnisteControllerTest {

    private static final String WRONG_ACCESS_RIGHT = "PIGGLYWIGGLY";

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

    private String getFixture(String fileName) throws Exception {
        return Files.readString(Paths.get(getClass().getResource(fileName).toURI()), StandardCharsets.UTF_8);
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void putOppijaShouldWork() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(oppijaServiceMock).create(any(OppijaTuontiCreateDto.class));
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void putOppijaShouldWorkWithoutSahkoposti() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        dto.setSahkoposti(null);

        mvc.perform(put(REQUEST_MAPPING)
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

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireHenkilot() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        dto.setHenkilot(null);

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldContainHenkilot() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        dto.setHenkilot(emptyList());

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldValidateHetu() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setHetu("hetu1");
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromNull() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(null);
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromEmpty() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(emptySet());
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromNullDto() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(Stream.of((KoodiUpdateDto) null).collect(toSet()));
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser("user1")
    public void putOppijaShouldRequireKansalaisuusFromNullKoodi() throws Exception {
        OppijaTuontiCreateDto dto = getValidOppijatCreateDto();
        OppijaTuontiRiviCreateDto oppijaCreateDto = getValidOppijaCreateDto();
        oppijaCreateDto.getHenkilo().setKansalaisuus(Stream.of((String) null).map(KoodiUpdateDto::new).collect(toSet()));
        dto.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
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

        mvc.perform(put(REQUEST_MAPPING)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void getTuontiPerustiedot() throws Exception {
        OppijaTuontiPerustiedotReadDto result = new OppijaTuontiPerustiedotReadDto(37337L, 1000, 1000, true);
        when(oppijaServiceMock.getTuontiById(anyLong())).thenReturn(result);

        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337/perustiedot"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(getFixture("/controller/yleistunniste/tuontiPerustiedot.json"), true));

        verify(oppijaServiceMock, times(1)).getTuontiById(37337L);
    }

    @Test
    @WithMockUser(authorities = WRONG_ACCESS_RIGHT)
    public void getTuontiPerustiedotAccessDenied() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337/perustiedot"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void getTuontiPerustiedotNotFound() throws Exception {
        when(oppijaServiceMock.getTuontiById(anyLong())).thenThrow(new NotFoundException());

        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337/perustiedot"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(oppijaServiceMock, times(1)).getTuontiById(37337L);
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void create() throws Exception {
        OppijaTuontiPerustiedotReadDto result = new OppijaTuontiPerustiedotReadDto(37337L, 1000, 1000, true);
        when(oppijaServiceMock.create(anyLong())).thenReturn(result);

        mvc.perform(post(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(getFixture("/controller/yleistunniste/tuontiPerustiedot.json"), true));

        verify(oppijaServiceMock, times(1)).create(37337L);
    }

    @Test
    @WithMockUser(roles = WRONG_ACCESS_RIGHT)
    public void createAccessDenied() throws Exception {
        mvc.perform(post(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void createNotFound() throws Exception {
        when(oppijaServiceMock.create(anyLong())).thenThrow(new NotFoundException());

        mvc.perform(post(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(oppijaServiceMock, times(1)).create(37337L);
    }

    @Test
    @WithMockUser(roles = WRONG_ACCESS_RIGHT)
    public void getOppijatByTuontiIdAccessDenied() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(oppijaServiceMock);
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void getOppijatByTuontiIdNotFound() throws Exception {
        when(oppijaServiceMock.getOppijatByTuontiId(anyLong())).thenThrow(new NotFoundException());

        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(oppijaServiceMock, times(1)).getOppijatByTuontiId(37337L);
    }

    @Test
    @WithMockUser(roles = YleistunnisteController.ACCESS_RIGHT)
    public void getOppijatByTuontiId() throws Exception {
        OppijaTuontiReadDto result = new OppijaTuontiReadDto(37337L, 1, 1, true,
                singletonList(new OppijaTuontiRiviReadDto("tunniste", new OppijaReadDto())));
        when(oppijaServiceMock.getOppijatByTuontiId(anyLong())).thenReturn(result);

        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(getFixture("/controller/yleistunniste/tuontiOppijat.json"), true));

        verify(oppijaServiceMock, times(1)).getOppijatByTuontiId(37337L);
    }
}
