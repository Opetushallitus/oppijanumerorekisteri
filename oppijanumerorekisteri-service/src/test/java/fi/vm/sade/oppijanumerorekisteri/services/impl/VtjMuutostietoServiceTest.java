package fi.vm.sade.oppijanumerorekisteri.services.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import com.fasterxml.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoKirjausavainRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;

@RunWith(SpringRunner.class)
@IntegrationTest
public class VtjMuutostietoServiceTest {

    @MockBean
    private VtjMuutostietoKirjausavainRepository kirjausavainRepository;
    @MockBean
    private HenkiloRepository henkiloRepository;
    @MockBean
    private HenkiloModificationService henkiloModificationService;
    @MockBean
    private VtjMuutostietoClient muutostietoClient;
    @MockBean
    private VtjMuutostietoRepository muutostietoRepository;
    @MockBean
    private KoodistoService koodistoService;
    @MockBean
    private SlackClient slackClient;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VtjMuutostietoServiceImpl muutostietoService;

    List<String> hetus = List.of("123456-111A", "101010-010B");
    List<VtjMuutostieto> muutostietos;
    VtjPerustieto perustieto;
    VtjPerustieto turvakielto;
    VtjPerustieto foreign;
    VtjPerustieto henkilotunnusKorjaus;

    @Before
    public void before() throws Exception {
        muutostietos = List.of(
                new VtjMuutostieto("123456-111A", LocalDateTime.now(), objectMapper.readTree(
                        "[{\"tietoryhma\": \"TURVAKIELTO\", \"muutosattribuutti\": \"LISATTY\", \"turvakieltoAktiivinen\": true}]")),
                new VtjMuutostieto("101010-010B", LocalDateTime.now(), objectMapper.readTree(
                        "[{\"tietoryhma\": \"TURVAKIELTO\", \"turvaLoppuPv\": {\"arvo\": \"2024-10-01\", \"tarkkuus\": \"PAIVA\"}, \"muutosattribuutti\": \"LISATTY\", \"turvakieltoAktiivinen\": true}]")));
        perustieto = new VtjPerustieto(hetus.get(0), objectMapper.readTree(new File("src/test/resources/henkilo/testVtjPerustieto.json")));
        turvakielto = new VtjPerustieto(hetus.get(0), objectMapper.readTree(new File("src/test/resources/henkilo/testVtjTurvakielto.json")));
        foreign = new VtjPerustieto(hetus.get(0), objectMapper.readTree(new File("src/test/resources/henkilo/testVtjForeign.json")));
        henkilotunnusKorjaus = new VtjPerustieto(hetus.get(0), objectMapper.readTree(new File("src/test/resources/henkilo/testVtjHenkilotunnusKorjaus.json")));

        Optional<Henkilo> henkilo = Optional.of(Henkilo.builder()
                .etunimet("etu")
                .sukunimi("suku")
                .hetu(hetus.get(0))
                .yhteystiedotRyhma(Set.of())
                .oidHenkilo("1.2.3.4.5")
                .build());
        henkilo.get().setId(1l);
        when(henkiloRepository.findByHetu(hetus.get(0)))
                .thenReturn(henkilo);
        when(koodistoService.list(Koodisto.KIELI))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KIELI).koodi("fr").koodi("fi").koodi("sv").build());
        when(koodistoService.list(Koodisto.KUNTA))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KUNTA).koodi("091").build());
        when(koodistoService.list(Koodisto.MAAT_JA_VALTIOT_2))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.MAAT_JA_VALTIOT_2).koodi("250").koodi("123").koodi("456").build());
    }

    @Test
    public void savePerustietoParsesCorrectForceUpdateDto() throws Exception {
        muutostietoService.savePerustieto(perustieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getEtunimet()).isEqualTo("Mathilda Helena Sophie");
        assertThat(actual.getSukunimi()).isEqualTo("Aslan Tes");
        assertThat(actual.getSyntymaaika()).isEqualTo(LocalDate.of(1958, 1, 30));
        assertThat(actual.getSukupuoli()).isEqualTo("2");
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi()).collect(Collectors.toSet()))
                .isEqualTo(Set.of("123", "456"));
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(actual.getKutsumanimi()).isEqualTo("Helena");
        assertThat(actual.getTurvakielto()).isFalse();
        assertThat(actual.getKotikunta()).isEqualTo("091");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi4", "yhteystietotyyppi8", "yhteystietotyyppi11");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals("alkupera1"));
        for (YhteystiedotRyhmaDto ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi4":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00780"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Öljymäki 11 C 3")
                            );
                    break;
                case "yhteystietotyyppi8":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, "helena@miukumauku.fi")
                            );
                    break;
                case "yhteystietotyyppi11":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00100"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Kaljamäki 12 B 4")
                            );
                    break;
                default:
                    throw new Exception("invalid ryhmakuvaus " + ryhma.getRyhmaKuvaus());
            }
        }
        verify(henkiloRepository, times(1)).save(any());
    }

    @Test
    public void savePerustietoParsesTurvakielto() throws Exception {
        muutostietoService.savePerustieto(turvakielto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getTurvakielto()).isTrue();
        assertThat(actual.getKotikunta()).isNull();
        assertThat(actual.getYhteystiedotRyhma()).isEmpty();
        verify(henkiloRepository, times(1)).save(any());
    }

    @Test
    public void savePerustietoParsesForeign() throws Exception {
        muutostietoService.savePerustieto(foreign);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi()).collect(Collectors.toSet()))
                .isEqualTo(Set.of("250"));
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("fr");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi5", "yhteystietotyyppi9");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals("alkupera1"));
        for (YhteystiedotRyhmaDto ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi9":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00780"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Öljymäki 11 C 3")
                            );
                    break;
                case "yhteystietotyyppi5":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "123 le street"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KUNTA, "Paris"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, "") // KoodiType metadata...
                            );
                    break;
                default:
                    throw new Exception("invalid ryhmakuvaus " + ryhma.getRyhmaKuvaus());
            }
        }
        verify(henkiloRepository, times(1)).save(any());
    }

    @Test
    public void savePerustietoHandlesHenkilotunnusKorjaus() throws Exception {
        muutostietoService.savePerustieto(henkilotunnusKorjaus);

        ArgumentCaptor<String> slackMessage = ArgumentCaptor.forClass(String.class);
        verify(slackClient, times(1)).sendToSlack(slackMessage.capture(), isNull());
        assertThat(slackMessage.getValue()).contains("1.2.3.4.5");
        verify(henkiloModificationService, never()).forceUpdateHenkilo(any());
        verify(henkiloRepository, never()).save(any());
    }

    @Test
    public void fetchMuutostietoBatchForBucketFetchesForExistingAvain() throws Exception {
        long bucketId = 1l;
        long existingAvain = 123l;
        when(kirjausavainRepository.findById(bucketId))
                .thenReturn(Optional.of(new VtjMuutostietoKirjausavain(bucketId, existingAvain, LocalDateTime.now())));
        when(muutostietoClient.fetchHenkiloMuutostieto(existingAvain, hetus))
                .thenReturn(new VtjMuutostietoResponse(existingAvain + 1l, muutostietos, true));

        boolean ajanTasalla = muutostietoService.fetchMuutostietoBatchForBucket(bucketId, hetus);
        assertThat(ajanTasalla).isTrue();

        verify(kirjausavainRepository, times(1)).save(any());
        verify(muutostietoRepository).saveAll(muutostietos);
    }

    @Test
    public void fetchMuutostietoBatchForBucketFetchesForNewAvain() throws Exception {
        long bucketId = 2l;
        long newAvain = 125l;
        when(kirjausavainRepository.findById(bucketId)).thenReturn(Optional.empty());
        when(muutostietoClient.fetchMuutostietoKirjausavain()).thenReturn(newAvain);
        when(muutostietoClient.fetchHenkiloMuutostieto(newAvain, hetus))
                .thenReturn(new VtjMuutostietoResponse(newAvain + 1l, muutostietos, false));

        boolean ajanTasalla = muutostietoService.fetchMuutostietoBatchForBucket(bucketId, hetus);
        assertThat(ajanTasalla).isFalse();

        verify(kirjausavainRepository, times(2)).save(any());
        verify(muutostietoRepository).saveAll(muutostietos);

    }
}
