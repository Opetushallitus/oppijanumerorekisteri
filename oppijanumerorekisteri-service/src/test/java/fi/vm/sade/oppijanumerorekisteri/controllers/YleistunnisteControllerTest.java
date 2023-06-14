package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.clients.impl.AwsSnsHenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YleistunnisteDto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.validators.OppijaTuontiCreatePostValidator;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.controllers.YleistunnisteController.REQUEST_MAPPING;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROOT_ORGANISATION_SUFFIX;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.YLEISTUNNISTE_LUONTI_ACCESS_RIGHT;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Sql("/controller/oppija/integration/fixture/truncate-tables.sql")
@Sql("/controller/oppija/integration/fixture/tuonti-test-fixture.sql")
@ActiveProfiles("dev")
@SpringBootTest(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, H2Configuration.class})
@AutoConfigureMockMvc
class YleistunnisteControllerTest {

    private static final String WRONG_ACCESS_RIGHT = "PIGGLYWIGGLY";
    private static final String hae = REQUEST_MAPPING + "/hae";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${dev.username}")
    private String username;

    @Value("${dev.password}")
    private String password;

    @MockBean
    private KoodistoService koodistoService;

    @MockBean
    private VtjClient vtjClient;

    @MockBean
    private AwsSnsHenkiloModifiedTopic henkiloModifiedTopic;

    @MockBean
    private OppijaTuontiCreatePostValidator tuontiValidator;


    private YleistunnisteController.YleistunnisteInput getValidYleistunnisteInput() {
        return YleistunnisteController.YleistunnisteInput.builder()
                .sahkoposti("example@example.com")
                .henkilot(Stream.of(getValidYleistunnisteInputRow()).collect(toList()))
                .build();
    }

    private YleistunnisteController.YleistunnisteInputRow getValidYleistunnisteInputRow() {
        return YleistunnisteController.YleistunnisteInputRow.builder()
                .tunniste("henkilo1")
                .henkilo(getValidYleistunnisteInputPerson())
                .build();
    }

    private YleistunnisteController.YleistunnisteInputPerson getValidYleistunnisteInputPerson() {
        return YleistunnisteController.YleistunnisteInputPerson.builder()
                .hetu("170897-935L")
                .etunimet("etu")
                .kutsumanimi("etu")
                .sukunimi("suku")
                .build();
    }

    @Test
    void requiresAuthentication() throws Exception {
        mvc.perform(post(hae))
                .andExpect(status().is4xxClientError());
    }


    @Test
    void requiresAuthorization() throws Exception {
        mvc.perform(post(hae)
                        .with(user(username).password(password).roles(WRONG_ACCESS_RIGHT)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void putOppijaShouldWork() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();

        MvcResult result = mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT + ROOT_ORGANISATION_SUFFIX))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andReturn();

        OppijaTuontiPerustiedotReadDto response = objectMapper.readValue(result.getResponse().getContentAsString(), OppijaTuontiPerustiedotReadDto.class);
        waitUntilTuontiKäsitelty(response.getId());
    }

    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void putOppijaShouldWorkWithoutSahkoposti() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        input.setSahkoposti(null);

        MvcResult result = mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT + ROOT_ORGANISATION_SUFFIX))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andReturn();

        OppijaTuontiPerustiedotReadDto response = objectMapper.readValue(result.getResponse().getContentAsString(), OppijaTuontiPerustiedotReadDto.class);
        waitUntilTuontiKäsitelty(response.getId());
    }

    @Test
    void putOppijaShouldValidateSahkoposti() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        input.setSahkoposti("lsdkjd");

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void putOppijaShouldRequireHenkilot() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        input.setHenkilot(null);

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void putOppijaShouldContainHenkilot() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        input.setHenkilot(emptyList());

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void putOppijaShouldValidateHetu() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        YleistunnisteController.YleistunnisteInputRow oppijaCreateDto = getValidYleistunnisteInputRow();
        oppijaCreateDto.getHenkilo().setHetu("hetu1");
        input.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void putOppijaShouldValidateHenkilo() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        YleistunnisteController.YleistunnisteInputRow oppijaCreateDto = getValidYleistunnisteInputRow();
        oppijaCreateDto.getHenkilo().setHetu(null);
        input.setHenkilot(Stream.of(oppijaCreateDto).collect(toList()));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void putOppijaShouldValidateEmptyHetu() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        YleistunnisteController.YleistunnisteInputRow oppijaCreateDto = getValidYleistunnisteInputRow();
        oppijaCreateDto.getHenkilo().setHetu("");
        input.setHenkilot(List.of(oppijaCreateDto));

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }


    @Test
    void getTuontiPerustiedot() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=1/perustiedot"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isOk(),
                        content().json(FilesystemHelper.getFixture("/controller/yleistunniste/tuontiPerustiedot.json"), true));
    }

    @Test
    void getTuontiPerustiedotNotFound() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=4/perustiedot"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void create() throws Exception {
        mvc.perform(post(String.format("%s%s", REQUEST_MAPPING, "/tuonti=1"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isOk(),
                        content().json(FilesystemHelper.getFixture("/controller/yleistunniste/tuontiPerustiedot.json"), true));
    }

    @Test
    void createNotFound() throws Exception {
        mvc.perform(post(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void getOppijatByTuontiIdNotFound() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void getOppijatByTuontiId() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=1"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT + ROOT_ORGANISATION_SUFFIX))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isOk(),
                        content().json(FilesystemHelper.getFixture("/controller/yleistunniste/tuontiOppijatMaster.json"), true));
    }

    @Test
    void getOppijatByTuontiIdResolvesOppijanumero() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=2"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT + ROOT_ORGANISATION_SUFFIX))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isOk(),
                        content().json(FilesystemHelper.getFixture("/controller/yleistunniste/tuontiOppijatDuplicate.json"), true));
    }

    @Test
    void haeValidatesInput() throws Exception {
        mvc.perform(post(hae)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void kutsumanimiIsRequired() throws Exception {
        HenkiloExistenceCheckDto request = HenkiloExistenceCheckDto.builder()
                .hetu("100690-1412")
                .etunimet("Seppo Matti")
                .sukunimi("Peipponen")
                .build();
        mvc.perform(createRequest(post("/yleistunniste/hae"), request)).andExpect(status().isBadRequest());
    }

    @Test
    void haeNotFound() throws Exception {
        mvc.perform(post(hae)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .content(FilesystemHelper.getFixture("/controller/yleistunniste/haeInputNotFound.json")))
                .andExpect(status().isNotFound());
    }


    @Test
    void haeConflicts() throws Exception {
        mvc.perform(post(hae)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .content(FilesystemHelper.getFixture("/controller/yleistunniste/haeInputConflict.json")))
                .andExpect(status().isConflict());
    }

    @Test
    void oppijanumeronHakuYleistunnisterajapinnallaEpäonnistuuVäärilläTiedoilla() throws Exception {
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu("100690-1412");
        yksiloityHenkilo.setEtunimi("Seppo Matti");
        yksiloityHenkilo.setKutsumanimi("Seppo");
        yksiloityHenkilo.setSukunimi("Peipponen");
        when(vtjClient.fetchHenkilo("100690-1412")).thenReturn(Optional.of(yksiloityHenkilo));

        HenkiloExistenceCheckDto request = HenkiloExistenceCheckDto.builder()
                .hetu("100690-1412")
                .etunimet("Pertti")
                .kutsumanimi("Pertti")
                .sukunimi("Virtanen")
                .build();
        mvc.perform(createRequest(post("/yleistunniste/hae"), request)).andExpect(status().isConflict());
    }

    @Test
    void haeFound() throws Exception {
        mvc.perform(post(hae)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .content(FilesystemHelper.getFixture("/controller/yleistunniste/haeInputFound.json")))
                .andExpectAll(
                        status().isOk(),
                        content().json(FilesystemHelper.getFixture("/controller/yleistunniste/haeOutput.json"))
                );
    }

    @Test
    void oppijanumeronVoiHakeaYleistunnisteRajapinnastaVtjTiedoilla() throws Exception {
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        yksiloityHenkilo.setHetu("100690-1412");
        yksiloityHenkilo.setEtunimi("Seppo Matti");
        yksiloityHenkilo.setKutsumanimi("Seppo");
        yksiloityHenkilo.setSukunimi("Peipponen");
        when(vtjClient.fetchHenkilo("100690-1412")).thenReturn(Optional.of(yksiloityHenkilo));

        HenkiloExistenceCheckDto request = HenkiloExistenceCheckDto.builder()
                .hetu("100690-1412")
                .etunimet("Seppo Matti")
                .kutsumanimi("Seppo")
                .sukunimi("Peipponen")
                .build();

        MvcResult result1 = mvc.perform(createRequest(post("/yleistunniste/hae"), request)).andExpect(status().isOk()).andReturn();
        verify(henkiloModifiedTopic, times(1)).publish(any());
        YleistunnisteDto response = objectMapper.readValue(result1.getResponse().getContentAsString(), YleistunnisteDto.class);
        verify(vtjClient, times(1)).fetchHenkilo(any());
        assertNotNull(response.getOppijanumero());
        assertEquals(response.getOppijanumero(), response.getOid());

        // Uudelleen haku ei enää tarkista tietoja VTJ:stä
        MvcResult result2 = mvc.perform(createRequest(post("/yleistunniste/hae"), request)).andExpect(status().isOk()).andReturn();
        YleistunnisteDto secondResponse = objectMapper.readValue(result2.getResponse().getContentAsString(), YleistunnisteDto.class);
        verifyNoMoreInteractions(vtjClient);
        assertEquals(secondResponse.getOid(), response.getOid());
        // Oppijanumero on null tokalla haulla. Syynä ilmeisesti se, että oppijan luonti ei automaattisesti yksilöi oppijaa vaikka tiedot varmistetaan VTJ:ltä
        assertNull(secondResponse.getOppijanumero());
    }

    @ParameterizedTest
    @ValueSource(strings = { "Marja", "Terttu", "Karpalo" })
    void oppijanumeroaEiVoiHakeaYleistunnisteRajapinnastaYhdelläVtjEtunimellä(String nimi) throws Exception {
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        String hetu = "170654-498T";
        yksiloityHenkilo.setHetu(hetu);
        yksiloityHenkilo.setEtunimi("Marja Terttu Karpalo");
        yksiloityHenkilo.setKutsumanimi("Terttu");
        yksiloityHenkilo.setSukunimi("Virtanen");
        when(vtjClient.fetchHenkilo(hetu)).thenReturn(Optional.of(yksiloityHenkilo));

        HenkiloExistenceCheckDto request = HenkiloExistenceCheckDto.builder()
                .hetu(hetu)
                .etunimet(nimi)
                .kutsumanimi(nimi)
                .sukunimi(yksiloityHenkilo.getSukunimi())
                .build();
        mvc.perform(createRequest(post("/yleistunniste/hae"), request)).andExpect(status().isConflict());
    }

    private void waitUntilTuontiKäsitelty(Long tuontiId) throws Exception {
        OppijaTuontiPerustiedotReadDto response;
        do {
            Thread.sleep(50);
            MvcResult status = mvc.perform(get(String.format("/yleistunniste/tuonti=%d/perustiedot", tuontiId))
                            .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andReturn();
            response = objectMapper.readValue(status.getResponse().getContentAsString(), OppijaTuontiPerustiedotReadDto.class);
        } while (!response.isKasitelty());
    }

    private <RequestT> MockHttpServletRequestBuilder createRequest(MockHttpServletRequestBuilder builder, RequestT requestBody) throws JsonProcessingException {
        return builder
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                .content(objectMapper.writeValueAsString(requestBody));
    }
}
