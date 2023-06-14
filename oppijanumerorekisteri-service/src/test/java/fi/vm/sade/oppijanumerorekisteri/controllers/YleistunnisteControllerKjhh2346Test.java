package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.clients.impl.AwsSnsHenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YleistunnisteDto;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.Optional;

import static fi.vm.sade.oppijanumerorekisteri.controllers.YleistunnisteController.REQUEST_MAPPING;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.YLEISTUNNISTE_LUONTI_ACCESS_RIGHT;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Sql("/controller/oppija/integration/fixture/truncate-tables.sql")
@Sql("/controller/oppija/integration/fixture/tuonti-test-fixture.sql")
@ActiveProfiles("dev")
@SpringBootTest(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, H2Configuration.class})
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "feature.kjhh-2346-salli-yksilointi-yhdella-etunimella=true",
})
class YleistunnisteControllerKjhh2346Test {
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
    private VtjClient vtjClient;

    @MockBean
    private AwsSnsHenkiloModifiedTopic henkiloModifiedTopic;

    @ParameterizedTest
    @ValueSource(strings = { "Marja", "Terttu", "Karpalo" })
    void oppijanumeronVoiHakeaYleistunnisteRajapinnastaYhdelläVtjEtunimellä(String nimi) throws Exception {
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
        MvcResult result1 = mvc.perform(createRequest(post("/yleistunniste/hae"), request)).andExpect(status().isOk()).andReturn();
        YleistunnisteDto response = objectMapper.readValue(result1.getResponse().getContentAsString(), YleistunnisteDto.class);

        verify(henkiloModifiedTopic, times(1)).publish(any());
        verify(vtjClient, times(1)).fetchHenkilo(any());
        assertNotNull(response.getOppijanumero());
        assertEquals(response.getOppijanumero(), response.getOid());

        // Uudelleen haku ei enää tarkista tietoja VTJ:stä
        reset(vtjClient);
        MvcResult result2 = mvc.perform(createRequest(post("/yleistunniste/hae"), request)).andExpect(status().isOk()).andReturn();
        YleistunnisteDto secondResponse = objectMapper.readValue(result2.getResponse().getContentAsString(), YleistunnisteDto.class);
        verify(vtjClient, times(0)).fetchHenkilo(any());
        assertEquals(secondResponse.getOid(), response.getOid());
        // Oppijanumero on null tokalla haulla. Syynä ilmeisesti se, että oppijan luonti ei automaattisesti yksilöi oppijaa vaikka tiedot varmistetaan VTJ:ltä
        assertNull(secondResponse.getOppijanumero());
    }

    @ParameterizedTest
    @ValueSource(strings = { "Marja", "Terttu", "Karpalo" })
    void oppijanumeronVoiHakeaYleistunnisteRajapinnastaYhdelläOppijanumerorekisteriinTallennetullaEtunimellä(String nimi) throws Exception {
        YksiloityHenkilo yksiloityHenkilo = new YksiloityHenkilo();
        String hetu = "170654-498T";
        yksiloityHenkilo.setHetu(hetu);
        yksiloityHenkilo.setEtunimi("Marja Terttu Karpalo");
        yksiloityHenkilo.setKutsumanimi("Terttu");
        yksiloityHenkilo.setSukunimi("Virtanen");
        when(vtjClient.fetchHenkilo(hetu)).thenReturn(Optional.of(yksiloityHenkilo));

        // Luodessa uutta oppijaa, kutsussa annettu etunimi/etunimet tallennetaan oppijanumerorekisteriin eikä VTJ:stä
        // saadut nimet. Luodaan siis ensin uusi oppija kaikilla nimillä, jotta voidaan testata, että olemassaolevan
        // oppijan oppijanumeron voi myös hakea käyttäen vain yhtä henkilön etunimistä.
        HenkiloExistenceCheckDto initialRequest = HenkiloExistenceCheckDto.builder()
                .hetu(hetu)
                .etunimet(yksiloityHenkilo.getEtunimi())
                .kutsumanimi(yksiloityHenkilo.getKutsumanimi())
                .sukunimi(yksiloityHenkilo.getSukunimi())
                .build();
        MvcResult initialResult = mvc.perform(createRequest(post("/yleistunniste/hae"), initialRequest)).andExpect(status().isOk()).andReturn();
        YleistunnisteDto initialResponse = objectMapper.readValue(initialResult.getResponse().getContentAsString(), YleistunnisteDto.class);
        verify(henkiloModifiedTopic, times(1)).publish(any());
        verify(vtjClient, times(1)).fetchHenkilo(any());
        assertNotNull(initialResponse.getOppijanumero());
        assertEquals(initialResponse.getOppijanumero(), initialResponse.getOid());


        reset(vtjClient);
        HenkiloExistenceCheckDto requestWithOneEtunimi = HenkiloExistenceCheckDto.builder()
                .hetu(hetu)
                .etunimet(nimi)
                .kutsumanimi(nimi)
                .sukunimi(yksiloityHenkilo.getSukunimi())
                .build();
        MvcResult result1 = mvc.perform(createRequest(post("/yleistunniste/hae"), requestWithOneEtunimi)).andExpect(status().isOk()).andReturn();
        YleistunnisteDto response = objectMapper.readValue(result1.getResponse().getContentAsString(), YleistunnisteDto.class);
        verify(vtjClient, times(0)).fetchHenkilo(any());
        assertEquals(response.getOid(), initialResponse.getOid());
    }

    private <RequestT> MockHttpServletRequestBuilder createRequest(MockHttpServletRequestBuilder builder, RequestT requestBody) throws JsonProcessingException {
        return builder
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(username).password(password).roles(YLEISTUNNISTE_LUONTI_ACCESS_RIGHT))
                .content(objectMapper.writeValueAsString(requestBody));
    }
}
