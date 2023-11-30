package fi.vm.sade.oppijanumerorekisteri.controllers;

import fi.vm.sade.oppijanumerorekisteri.KoodiTypeBuilder;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.dto.KoodiUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OppijanTuontiTest extends OppijanumerorekisteriApiTest {
    @MockBean
    KoodistoService koodistoService;

    private static final KoodiUpdateDto MAATJAVALTIOT2_PUOLA = new KoodiUpdateDto("616");

    @Test
    @UserOppijoidenTuoja
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void minimalValidTuontiWithEmail() throws Exception {
        initKoodistoMock();
        var request = OppijaTuontiCreateDto.builder()
                .henkilot(List.of(
                                OppijaTuontiRiviCreateDto.builder()
                                        .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                                .etunimet("Minna").kutsumanimi("Minna").sukunimi("Meikäläinen")
                                                .kansalaisuus(List.of(MAATJAVALTIOT2_PUOLA))
                                                .sahkoposti("example@example.fi")
                                                .build())
                                        .tunniste("testUpdateYhteystiedotDeletesOtherYhteystietos")
                                        .build()
                        )

                )
                .build();
        var response = putTuonti(request);
        waitUntilTuontiKäsitelty(response.getId());
    }

    @Test
    @UserOppijoidenTuoja
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void emptyEmailIsInvalid() throws Exception {
        initKoodistoMock();
        var request = OppijaTuontiCreateDto.builder()
                .henkilot(List.of(
                                OppijaTuontiRiviCreateDto.builder()
                                        .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                                .etunimet("Mirva").kutsumanimi("Mirva").sukunimi("Virtanen")
                                                .kansalaisuus(List.of(MAATJAVALTIOT2_PUOLA))
                                                .sahkoposti("")
                                                .build())
                                        .tunniste("emptyEmailIsInvalid")
                                        .build()
                        )

                )
                .build();

        mvc.perform(createRequest(put("/oppija"), request))
                .andExpect(status().is(400));
    }

    @Test
    @UserOppijoidenTuoja
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void failWithNoIdentifiersGiven() throws Exception {
        initKoodistoMock();
        var request = OppijaTuontiCreateDto.builder()
                .henkilot(List.of(
                                OppijaTuontiRiviCreateDto.builder()
                                        .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                                .etunimet("Tuukka").kutsumanimi("Tuukka").sukunimi("Tunnisteeton")
                                                .kansalaisuus(List.of(MAATJAVALTIOT2_PUOLA))
                                                .build())
                                        .tunniste("failWithNoIdentifiersGiven")
                                        .build()
                        )

                )
                .build();

        mvc.perform(createRequest(put("/oppija"), request))
                .andExpect(status().is(400));
    }

    private OppijaTuontiPerustiedotReadDto putTuonti(OppijaTuontiCreateDto create) throws Exception {
        MvcResult result = mvc.perform(createRequest(put("/oppija"), create))
                .andExpect(status().is(200)).andReturn();
        String json = result.getResponse().getContentAsString();
        return objectMapper.readValue(json, OppijaTuontiPerustiedotReadDto.class);
    }

    private void waitUntilTuontiKäsitelty(Long tuontiId) throws Exception {
        OppijaTuontiPerustiedotReadDto response;
        do {
            Thread.sleep(50);
            MvcResult status = mvc.perform(get(String.format("/oppija/tuonti=%d/perustiedot", tuontiId))
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andReturn();
            response = objectMapper.readValue(status.getResponse().getContentAsString(), OppijaTuontiPerustiedotReadDto.class);
        } while (!response.isKasitelty());
    }

    private void initKoodistoMock() {
        when(koodistoService.list(Koodisto.MAAT_JA_VALTIOT_2)).thenReturn(List.of(
                new KoodiTypeBuilder(Koodisto.MAAT_JA_VALTIOT_2, MAATJAVALTIOT2_PUOLA.getKoodi()).versio(1).build()
        ));
    }
}
