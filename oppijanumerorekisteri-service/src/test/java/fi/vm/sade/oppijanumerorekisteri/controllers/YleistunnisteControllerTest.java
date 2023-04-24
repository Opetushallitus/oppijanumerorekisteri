package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.validators.OppijaTuontiCreatePostValidator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.controllers.YleistunnisteController.REQUEST_MAPPING;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROOT_ORGANISATION_SUFFIX;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.YLEISTUNNISTE_LUONTI_ACCESS_RIGHT;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;
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
    void putOppijaShouldWork() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT + ROOT_ORGANISATION_SUFFIX))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk());
    }

    @Test
    void putOppijaShouldWorkWithoutSahkoposti() throws Exception {
        YleistunnisteController.YleistunnisteInput input = getValidYleistunnisteInput();
        input.setSahkoposti(null);

        mvc.perform(put(REQUEST_MAPPING)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT + ROOT_ORGANISATION_SUFFIX))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk());
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
    public void createNotFound() throws Exception {
        mvc.perform(post(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void getOppijatByTuontiIdNotFound() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=37337"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void getOppijatByTuontiId() throws Exception {
        mvc.perform(get(String.format("%s%s", REQUEST_MAPPING, "/tuonti=1"))
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT + ROOT_ORGANISATION_SUFFIX))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpectAll(
                        status().isOk(),
                        content().json(FilesystemHelper.getFixture("/controller/yleistunniste/tuontiOppijat.json"), true));
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
    public void haeNotFound() throws Exception {
        mvc.perform(post(hae)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .content(FilesystemHelper.getFixture("/controller/yleistunniste/haeInputNotFound.json")))
                .andExpect(status().isNotFound());
    }


    @Test
    public void haeConflicts() throws Exception {
        mvc.perform(post(hae)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .content(FilesystemHelper.getFixture("/controller/yleistunniste/haeInputConflict.json")))
                .andExpect(status().isConflict());
    }

    @Test
    public void haeFound() throws Exception {
        mvc.perform(post(hae)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                        .content(FilesystemHelper.getFixture("/controller/yleistunniste/haeInputFound.json")))
                .andExpectAll(
                        status().isOk(),
                        content().json(FilesystemHelper.getFixture("/controller/yleistunniste/haeOutput.json"))
                );
    }
}
