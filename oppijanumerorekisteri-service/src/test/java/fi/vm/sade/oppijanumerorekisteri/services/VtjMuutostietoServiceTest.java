package fi.vm.sade.oppijanumerorekisteri.services;

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
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.assertj.core.groups.Tuple;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.validation.BindException;

import com.fasterxml.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikunta;
import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TurvakieltoKotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TurvakieltoKotikuntaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoKirjausavainRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoRepository;

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
    private TurvakieltoKotikuntaRepository turvakieltoKotikuntaRepository;
    @Autowired
    private KotikuntaHistoriaRepository kotikuntaHistoriaRepository;
    @Autowired
    private TurvakieltoKotikuntaHistoriaRepository turvakieltoKotikuntaHistoriaRepository;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VtjMuutostietoService muutostietoService;

    List<String> hetus = List.of("123456-111A", "101010-010B");
    List<VtjMuutostieto> muutostietos;
    VtjPerustieto perustieto;
    VtjPerustieto turvakielto;
    VtjPerustieto foreign;
    VtjPerustieto henkilotunnusKorjaus;

    Optional<Henkilo> henkilo = Optional.of(Henkilo.builder()
            .etunimet("etu")
            .sukunimi("suku")
            .kutsumanimi("etu")
            .kansalaisuus(Set.of(new Kansalaisuus("152")))
            .hetu(hetus.get(0))
            .aidinkieli(Kielisyys.builder().kieliKoodi("fi").build())
            .yhteystiedotRyhma(Set.of())
            .huoltajat(Set.of())
            .oidHenkilo("1.2.3.4.5")
            .build());

    Henkilo.builder henkiloBuilder = Henkilo.builder()
            .etunimet("etu")
            .sukunimi("suku")
            .kutsumanimi("etu")
            .hetu(hetus.get(0))
            .kotikunta("123")
            .yhteystiedotRyhma(Set.of(
                    new YhteystiedotRyhma("yhteystietotyyppi9", "alkupera1", false,
                            Set.of(new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE,
                                    "kadu osoite 123"),
                                    new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI,
                                            "hesa"),
                                    new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO,
                                            "12345"))),
                    new YhteystiedotRyhma("yhteystietotyyppi8", "alkupera1", false,
                            Set.of(new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI,
                                    "sahko@posti.fi")))))
            .huoltajat(Set.of())
            .oidHenkilo("1.2.3.4.5");

    private void assertKotikuntaHistoria(Long henkiloId, Tuple... values) {
        assertThat(kotikuntaHistoriaRepository.findAllByHenkiloId(henkiloId))
                .extracting(KotikuntaHistoria::getKotikunta, KotikuntaHistoria::getKuntaanMuuttopv, KotikuntaHistoria::getKunnastaPoisMuuttopv)
                .containsExactlyInAnyOrder(values);
    }

    private void assertTurvakieltoKotikuntaHistoria(Long henkiloId, Tuple... values) {
        assertThat(turvakieltoKotikuntaHistoriaRepository.findAllByHenkiloId(henkiloId))
                .extracting(TurvakieltoKotikuntaHistoria::getKotikunta, TurvakieltoKotikuntaHistoria::getKuntaanMuuttopv, TurvakieltoKotikuntaHistoria::getKunnastaPoisMuuttopv)
                .containsExactlyInAnyOrder(values);
    }

    @Before
    public void before() throws Exception {
        muutostietos = List.of(
                new VtjMuutostieto("123456-111A", LocalDateTime.now(), objectMapper.readTree(
                        "[{\"tietoryhma\": \"TURVAKIELTO\", \"muutosattribuutti\": \"LISATTY\", \"turvakieltoAktiivinen\": true}]"),
                        null,
                        false),
                new VtjMuutostieto("101010-010B", LocalDateTime.now(), objectMapper.readTree(
                        "[{\"tietoryhma\": \"TURVAKIELTO\", \"turvaLoppuPv\": {\"arvo\": \"2024-10-01\", \"tarkkuus\": \"PAIVA\"}, \"muutosattribuutti\": \"LISATTY\", \"turvakieltoAktiivinen\": true}]"),
                        null,
                        false));
        perustieto = new VtjPerustieto(hetus.get(0),
                objectMapper.readTree(new File("src/test/resources/vtj/perustieto.json")));
        turvakielto = new VtjPerustieto(hetus.get(0),
                objectMapper.readTree(new File("src/test/resources/vtj/perustietoTurvakielto.json")));
        foreign = new VtjPerustieto(hetus.get(0),
                objectMapper.readTree(new File("src/test/resources/vtj/perustietoUlkomainen.json")));
        henkilotunnusKorjaus = new VtjPerustieto(hetus.get(0),
                objectMapper.readTree(new File("src/test/resources/vtj/perustietoHetuKorjaus.json")));

        when(koodistoService.list(Koodisto.KIELI))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KIELI).koodi("FR").koodi("FI").koodi("SV")
                        .koodi("98")
                        .build());
        when(koodistoService.list(Koodisto.KUNTA))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.KUNTA).koodi("091").koodi("287").build());
        when(koodistoService.list(Koodisto.MAAT_JA_VALTIOT_2))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.MAAT_JA_VALTIOT_2)
                        .koodi("246")
                        .koodi("250")
                        .koodi("123")
                        .koodi("456")
                        .koodi("729")
                        .koodi("736")
                        .koodi("998")
                        .build());
    }

    @Test
    public void savePerustieto() throws Exception {
        henkilo.get().setId(1l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
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
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00780"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Öljymäki 11 C 3"));
                    break;
                case "yhteystietotyyppi8":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, "helena@miukumauku.fi"));
                    break;
                case "yhteystietotyyppi11":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00100"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Kaljamäki 12 B 4"));
                    break;
                default:
                    throw new Exception("invalid ryhmakuvaus " + ryhma.getRyhmaKuvaus());
            }
        }
        verify(henkiloRepository, times(1)).save(any());

        assertKotikuntaHistoria(1l,
                tuple("049", LocalDate.of(1994, 1, 1), LocalDate.of(1996, 3, 21)),
                tuple("091", LocalDate.of(1996, 3, 22), LocalDate.of(2001, 7, 8)),
                tuple("200", LocalDate.of(2001, 7, 9), LocalDate.of(2012, 10, 27)),
                tuple("049", LocalDate.of(2012, 10, 28), LocalDate.of(2019, 5, 3)),
                tuple("091", LocalDate.of(2019, 5, 4), null));
    }

    @Test
    public void savePerustietoOverridesExistingKotikuntaHistoria() throws Exception {
        henkilo.get().setId(11l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                        .henkiloId(11l)
                        .kotikunta("321")
                        .kuntaanMuuttopv(LocalDate.of(2013, 3, 12))
                        .build());

        muutostietoService.savePerustieto(perustieto);

        assertKotikuntaHistoria(11l,
                tuple("049", LocalDate.of(1994, 1, 1), LocalDate.of(1996, 3, 21)),
                tuple("091", LocalDate.of(1996, 3, 22), LocalDate.of(2001, 7, 8)),
                tuple("200", LocalDate.of(2001, 7, 9), LocalDate.of(2012, 10, 27)),
                tuple("049", LocalDate.of(2012, 10, 28), LocalDate.of(2019, 5, 3)),
                tuple("091", LocalDate.of(2019, 5, 4), null));
    }

    @Test
    public void savePerustietoParsesTurvakielto() throws Exception {
        henkilo.get().setId(2l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                        .henkiloId(2l)
                        .kotikunta("123")
                        .kuntaanMuuttopv(LocalDate.of(2015, 3, 12))
                        .build());

        muutostietoService.savePerustieto(turvakielto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(actual.getTurvakielto()).isTrue();
        assertThat(actual.getKotikunta()).isNull();
        assertThat(actual.getYhteystiedotRyhma()).isEmpty();
        verify(henkiloRepository, times(1)).save(any());

        TurvakieltoKotikunta turvakieltoKotikunta = turvakieltoKotikuntaRepository.findByHenkiloId(2l).get();
        assertThat(turvakieltoKotikunta.getKotikunta()).isEqualTo("091");

        assertKotikuntaHistoria(2l,
                tuple("123", LocalDate.of(2015, 3, 12), LocalDate.of(2019, 5, 3)));

        assertTurvakieltoKotikuntaHistoria(2l,
                tuple("091", LocalDate.of(2019, 5, 4), null));
    }

    @Test
    public void savePerustietoParsesForeign() throws Exception {
        henkilo.get().setId(3l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
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
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00780"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Öljymäki 11 C 3"));
                    break;
                case "yhteystietotyyppi5":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "123 le street"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KUNTA, "Paris"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""));
                    break;
                default:
                    throw new Exception("invalid ryhmakuvaus " + ryhma.getRyhmaKuvaus());
            }
        }
        verify(henkiloRepository, times(1)).save(any());
    }

    @Test
    public void savePerustietoParsesHuoltaja() throws Exception {
        henkilo.get().setId(4l);
        VtjPerustieto huoltajaPerustieto = new VtjPerustieto(hetus.get(0),
                objectMapper.readTree(new File("src/test/resources/vtj/perustietoHuoltaja.json")));
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        muutostietoService.savePerustieto(huoltajaPerustieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        verify(henkiloRepository, times(1)).save(any());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getHuoltajat()).hasSize(2);
        Iterator<HuoltajaCreateDto> iter = actual.getHuoltajat().iterator();
        HuoltajaCreateDto huoltaja1 = iter.next();
        assertThat(huoltaja1.getHetu()).isEqualTo("220271-949R");
        assertThat(huoltaja1.getEtunimet()).isEqualTo("Leo Albert");
        assertThat(huoltaja1.getKutsumanimi()).isEqualTo("Leo Albert");
        assertThat(huoltaja1.getSukunimi()).isEqualTo("Lukkari Tes");
        assertThat(huoltaja1.getSyntymaaika()).isEqualTo(LocalDate.of(2001, 1, 1));
        assertThat(huoltaja1.getHuoltajuusAlku()).isEqualTo(LocalDate.of(2020, 3, 25));
        assertThat(huoltaja1.getHuoltajuusLoppu()).isEqualTo(LocalDate.of(2036, 1, 1));
        HuoltajaCreateDto huoltaja2 = iter.next();
        assertThat(huoltaja2.getHetu()).isEqualTo("111075-9782");
        assertThat(huoltaja2.getEtunimet()).isEqualTo("Chira Sabine");
        assertThat(huoltaja2.getKutsumanimi()).isEqualTo("Chira Sabine");
        assertThat(huoltaja2.getSukunimi()).isEqualTo("Karlsson Tes");
        assertThat(huoltaja2.getSyntymaaika()).isEqualTo(LocalDate.of(2001, 2, 15));
        assertThat(huoltaja2.getHuoltajuusAlku()).isEqualTo(LocalDate.of(2020, 3, 25));
        assertThat(huoltaja2.getHuoltajuusLoppu()).isEqualTo(LocalDate.of(2036, 1, 1));
    }

    @Test
    public void savePerustietoHandlesHenkilotunnusKorjaus() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
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

    private VtjMuutostieto getMuutostieto(String path) throws Exception {
        try (var is = getClass().getResourceAsStream(path)) {
            return new VtjMuutostieto(hetus.get(0), LocalDateTime.now(), objectMapper.readTree(is), null, false);
        }
    }

    @Test
    public void saveMuutostietoDoesNotSaveIfHenkiloIsPassivoitu() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0)))
                .thenReturn(Optional.of(Henkilo.builder()
                        .hetu(hetus.get(0))
                        .passivoitu(true)
                        .build()));
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoEtunimenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);

        verify(muutostietoRepository, times(1)).save(any());
        verify(henkiloModificationService, times(0)).forceUpdateHenkilo(any());
    }

    @Test
    public void saveMuutostietoSetsMuutostietoErrorIfValidationFails() throws Exception {
        henkilo.get().setId(5l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        when(henkiloModificationService.forceUpdateHenkilo(any()))
                .thenThrow(new UnprocessableEntityException(
                        new BindException(new HenkiloForceUpdateDto(), "henkiloForceUpdateDto")));
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoEtunimenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(any());

        ArgumentCaptor<VtjMuutostieto> argument = ArgumentCaptor.forClass(VtjMuutostieto.class);
        verify(muutostietoRepository, times(1)).save(argument.capture());
        VtjMuutostieto actual = argument.getValue();
        assertThat(actual.getError()).isTrue();
    }

    @Test
    public void saveMuutostietoSavesEtunimenmuutos() throws Exception {
        henkilo.get().setId(6l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoEtunimenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getEtunimet()).isEqualTo("Mathilda Helena Sophie");
        assertThat(actual.getSukunimi()).isEqualTo("Aslan Tes");
    }

    @Test
    public void saveMuutostietoSavesHenkilotunnusmuutos() throws Exception {
        henkilo.get().setId(7l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoHenkilotunnusmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getHetu()).isEqualTo("010869-9983");
    }

    @Test
    public void saveMuutostietoSavesSukupuolenmuutos() throws Exception {
        henkilo.get().setId(8l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoSukupuolenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getHetu()).isEqualTo("021086-998R");
        assertThat(actual.getSukupuoli()).isEqualTo("2");
    }

    @Test
    public void saveMuutostietoSavesSukunimenmuutos() throws Exception {
        henkilo.get().setId(9l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoSukunimenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getEtunimet()).isEqualTo("Kurt Helge");
        assertThat(actual.getSukunimi()).isEqualTo("von Olme-Tes");
    }

    @Test
    public void saveMuutostietoSavesKutsumanimenmuutos() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(Optional.of(Henkilo.builder()
            .etunimet("Mathilda Helena Sophie")
            .sukunimi("Aslan Tes")
            .kansalaisuus(Set.of(new Kansalaisuus("152")))
            .hetu(hetus.get(0))
            .yhteystiedotRyhma(Set.of())
            .oidHenkilo("1.2.3.4.5")
            .build()));
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoKutsumanimenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKutsumanimi()).isEqualTo("Helena");
    }

    @Test
    public void saveMuutostietoSavesKuolema() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoKuolema.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKuolinpaiva()).isEqualTo(LocalDate.of(2019, 6, 6));
    }

    @Test
    public void saveMuutostietoSavesKuolinpaivanPoisto() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoKuolinpaivanPoisto.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKuolinpaiva()).isNull();
    }

    @Test
    public void saveMuutostietoSavesKunnastaToiseenMuutto() throws Exception {
        henkilo.get().setId(13245l);
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);

        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                        .henkiloId(13245l)
                        .kotikunta("222")
                        .kuntaanMuuttopv(LocalDate.of(2012, 1, 5))
                        .build());

        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoKunnastaToiseenMuutto.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKotikunta()).isEqualTo("287");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi4");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals("alkupera1"));
        for (YhteystiedotRyhmaDto ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi4":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "MYRKKY"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "64370"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Gabriella 6a-6b A 2 a"));
                    break;
            }
        }

        assertKotikuntaHistoria(13245l,
                tuple("222", LocalDate.of(2012, 1, 5), LocalDate.of(2019, 6, 26)),
                tuple("287", LocalDate.of(2019, 6, 27), null));
    }

    @Test
    public void handleKotikuntaPoistettuMuutostieto() throws Exception {
        var henkiloId = 828282L;
        var henkilo = henkiloBuilder
                .kotikunta("049")
                .build();
        henkilo.setId(henkiloId);

        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                .henkiloId(henkiloId)
                .kotikunta("091")
                .kuntaanMuuttopv(LocalDate.of(2020, 1, 1))
                .kunnastaPoisMuuttopv(LocalDate.of(2023, 12, 31))
                .build());
        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                .henkiloId(henkiloId)
                .kotikunta("049")
                .kuntaanMuuttopv(LocalDate.of(2024, 1, 1))
                .build());

        assertKotikuntaHistoria(
                henkiloId,
                tuple("091", LocalDate.of(2020, 1, 1), LocalDate.of(2023, 12, 31)),
                tuple("049", LocalDate.of(2024, 1, 1), null)
        );

        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(Optional.of(henkilo));
        var muutostieto = getMuutostieto("/vtj/muutostietoKotikunnanPoisto.json");
        muutostietoService.updateHenkilo(muutostieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKotikunta()).isEqualTo("091");
        assertKotikuntaHistoria(
                henkiloId,
                tuple("091", LocalDate.of(2020, 1, 1), null)
        );
    }

    private HenkiloForceUpdateDto doUpdateHenkilo(Henkilo henkilo, String updateJson) throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(Optional.of(henkilo));
        VtjMuutostieto muutostieto = getMuutostieto(updateJson);
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        return argument.getValue();
    }

    @Test
    public void saveMuutostietoSavesTurvakieltoWithExistingKotikunta() throws Exception {
        Long henkiloId = 321l;
        var henkilo = henkiloBuilder.build();
        henkilo.setId(henkiloId);
        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                        .henkiloId(henkiloId)
                        .kotikunta("123")
                        .kuntaanMuuttopv(LocalDate.of(2015, 3, 12))
                        .build());

        HenkiloForceUpdateDto actual = doUpdateHenkilo(henkilo, "/vtj/muutostietoTurvakielto.json");

        assertThat(actual.getKotikunta()).isNull();
        assertThat(actual.getYhteystiedotRyhma()).isEmpty();
        TurvakieltoKotikunta turvakieltoKotikunta = turvakieltoKotikuntaRepository.findByHenkiloId(henkiloId).get();
        assertThat(turvakieltoKotikunta.getKotikunta()).isEqualTo("123");
        assertKotikuntaHistoria(henkiloId,
                tuple("123", LocalDate.of(2015, 3, 12), LocalDate.now().minusDays(1)));
        assertTurvakieltoKotikuntaHistoria(henkiloId,
                tuple("123", LocalDate.now(), null));
    }

    @Test
    public void saveMuutostietoSavesTurvakieltoWithNewKotikunta() throws Exception {
        Long henkiloId = 322l;
        var henkilo = henkiloBuilder.build();
        henkilo.setId(henkiloId);
        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                        .henkiloId(henkiloId)
                        .kotikunta("123")
                        .kuntaanMuuttopv(LocalDate.of(2015, 3, 12))
                        .build());

        HenkiloForceUpdateDto actual = doUpdateHenkilo(henkilo, "/vtj/muutostietoTurvakieltoKunnastaMuutto.json");

        assertThat(actual.getKotikunta()).isNull();
        assertThat(actual.getYhteystiedotRyhma()).isEmpty();
        TurvakieltoKotikunta turvakieltoKotikunta = turvakieltoKotikuntaRepository.findByHenkiloId(henkiloId).get();
        assertThat(turvakieltoKotikunta.getKotikunta()).isEqualTo("287");
        assertTurvakieltoKotikuntaHistoria(henkiloId,
                tuple("287", LocalDate.of(2019, 6, 27), null));
        assertKotikuntaHistoria(henkiloId,
                tuple("123", LocalDate.of(2015, 3, 12), LocalDate.of(2019, 6, 26)));
    }

    @Test
    public void saveMuutostietoUpdatesTurvakieltoKotikunta() throws Exception {
        Long henkiloId = 323l;
        Henkilo henkiloWithTurvakielto = henkiloBuilder.turvakielto(true).kotikunta(null).build();
        henkiloWithTurvakielto.setId(henkiloId);
        turvakieltoKotikuntaHistoriaRepository.save(TurvakieltoKotikuntaHistoria.builder()
                        .henkiloId(henkiloId)
                        .kotikunta("123")
                        .kuntaanMuuttopv(LocalDate.of(2015, 3, 12))
                        .build());
        turvakieltoKotikuntaRepository.save(TurvakieltoKotikunta.builder().henkiloId(henkiloId).kotikunta("091").build());

        HenkiloForceUpdateDto actual = doUpdateHenkilo(henkiloWithTurvakielto, "/vtj/muutostietoKunnastaToiseenMuutto.json");

        assertThat(actual.getKotikunta()).isNull();
        assertThat(actual.getTurvakielto()).isTrue();
        TurvakieltoKotikunta turvakieltoKotikunta = turvakieltoKotikuntaRepository.findByHenkiloId(henkiloId).get();
        assertThat(turvakieltoKotikunta.getKotikunta()).isEqualTo("287");
        assertKotikuntaHistoria(henkiloId);
        assertTurvakieltoKotikuntaHistoria(henkiloId,
                tuple("123", LocalDate.of(2015, 3, 12), LocalDate.of(2019, 6, 26)),
                tuple("287", LocalDate.of(2019, 6, 27), null));
    }

    @Test
    public void saveMuutostietoRemovesTurvakieltoKotikuntaWithExistingKotikunta() throws Exception {
        Long henkiloId = 324l;
        Henkilo henkiloWithTurvakielto = henkiloBuilder.turvakielto(true).kotikunta(null).build();
        henkiloWithTurvakielto.setId(henkiloId);
        turvakieltoKotikuntaHistoriaRepository.save(TurvakieltoKotikuntaHistoria.builder()
                        .henkiloId(henkiloId)
                        .kotikunta("091")
                        .kuntaanMuuttopv(LocalDate.of(2015, 3, 12))
                        .build());
        turvakieltoKotikuntaRepository.save(TurvakieltoKotikunta.builder().henkiloId(henkiloId).kotikunta("091").build());

        HenkiloForceUpdateDto actual = doUpdateHenkilo(henkiloWithTurvakielto, "/vtj/muutostietoTurvakieltoPois.json");

        assertThat(actual.getKotikunta()).isEqualTo("091");
        assertThat(actual.getTurvakielto()).isFalse();
        assertThat(turvakieltoKotikuntaRepository.findByHenkiloId(henkiloId)).isEmpty();
        assertKotikuntaHistoria(henkiloId,
                tuple("091", LocalDate.now(), null));
        assertTurvakieltoKotikuntaHistoria(henkiloId,
                tuple("091", LocalDate.of(2015, 3, 12), LocalDate.now().minusDays(1)));
    }

    @Test
    public void saveMuutostietoRemovesTurvakieltoKotikuntaWithNewKotikunta() throws Exception {
        Long henkiloId = 325l;
        Henkilo henkiloWithTurvakielto = henkiloBuilder.turvakielto(true).kotikunta(null).build();
        henkiloWithTurvakielto.setId(henkiloId);
        turvakieltoKotikuntaHistoriaRepository.save(TurvakieltoKotikuntaHistoria.builder()
                        .henkiloId(henkiloId)
                        .kotikunta("091")
                        .kuntaanMuuttopv(LocalDate.of(2015, 3, 12))
                        .build());
        turvakieltoKotikuntaRepository.save(TurvakieltoKotikunta.builder().henkiloId(henkiloId).kotikunta("091").build());

        HenkiloForceUpdateDto actual = doUpdateHenkilo(henkiloWithTurvakielto, "/vtj/muutostietoTurvakieltoPoisKunnastaMuutto.json");

        assertThat(actual.getKotikunta()).isEqualTo("287");
        assertThat(actual.getTurvakielto()).isFalse();
        assertThat(turvakieltoKotikuntaRepository.findByHenkiloId(henkiloId)).isEmpty();
        assertKotikuntaHistoria(henkiloId,
                tuple("287", LocalDate.of(2019, 6, 27), null));
        assertTurvakieltoKotikuntaHistoria(henkiloId,
                tuple("091", LocalDate.of(2015, 3, 12), LocalDate.of(2019, 6, 26)));
    }

    @Test
    public void saveMuutostietoSavesKansalaisuus() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoKansalaisuudenLisaysJaPassivointi.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi())
                .collect(Collectors.toSet()))
                .isEqualTo(Set.of("246"));
    }

    @Test
    public void saveMuutostietoSavesPostiosoitteenmuutos() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoPostiosoitteenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi11");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhmaDto::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals("alkupera1"));
        for (YhteystiedotRyhmaDto ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi11":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(YhteystietoDto::getYhteystietoTyyppi, YhteystietoDto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "VAASA"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "65100"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Vaasagatan 34 016"));
                    break;
            }
        }
    }

    @Test
    public void saveMuutostietoSavesAidinkielenmuutos() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoAidinkieli.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("98");
    }

    @Test
    public void saveMuutostietoSavesNewHuoltaja() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoHuoltosuhteenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getHuoltajat()).hasSize(1);
        HuoltajaCreateDto huoltaja = actual.getHuoltajat().iterator().next();
        assertThat(huoltaja.getHetu()).isEqualTo("280790-9696");
        assertThat(huoltaja.getEtunimet()).isEqualTo("Henriikka Sandra");
        assertThat(huoltaja.getKutsumanimi()).isEqualTo("Henriikka Sandra");
        assertThat(huoltaja.getSukunimi()).isEqualTo("Valkeavirta Tes");
        assertThat(huoltaja.getSyntymaaika()).isEqualTo(LocalDate.of(1984, 6, 1));
        assertThat(huoltaja.getHuoltajuusAlku()).isEqualTo(LocalDate.of(2012, 8, 2));
        assertThat(huoltaja.getHuoltajuusLoppu()).isEqualTo(LocalDate.of(2030, 8, 1));
    }

    @Test
    public void saveMuutostietoUpdatesCurrentHuoltaja() throws Exception {
        Henkilo oldHuoltaja = Henkilo.builder()
                .etunimet("huol")
                .sukunimi("taja")
                .kansalaisuus(Set.of(new Kansalaisuus("152")))
                .hetu("280790-9696")
                .yhteystiedotRyhma(Set.of())
                .huoltajat(Set.of())
                .oidHenkilo("1.2.3.4.5")
                .build();
        Optional<Henkilo> henkiloWithHuoltaja = Optional.of(Henkilo.builder()
                .etunimet("etu")
                .sukunimi("suku")
                .kansalaisuus(Set.of(new Kansalaisuus("152")))
                .hetu(hetus.get(0))
                .yhteystiedotRyhma(Set.of())
                .huoltajat(Set.of(new HenkiloHuoltajaSuhde(henkilo.get(), oldHuoltaja, LocalDate.of(1900, 1, 1), null,
                        null, null)))
                .oidHenkilo("1.2.3.4.5")
                .build());
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkiloWithHuoltaja);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoHuoltosuhteenmuutos.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getHuoltajat()).hasSize(1);
        HuoltajaCreateDto huoltaja = actual.getHuoltajat().iterator().next();
        assertThat(huoltaja.getHetu()).isEqualTo("280790-9696");
        assertThat(huoltaja.getEtunimet()).isEqualTo("Henriikka Sandra");
        assertThat(huoltaja.getKutsumanimi()).isEqualTo("Henriikka Sandra");
        assertThat(huoltaja.getSukunimi()).isEqualTo("Valkeavirta Tes");
        assertThat(huoltaja.getSyntymaaika()).isEqualTo(LocalDate.of(1984, 6, 1));
        assertThat(huoltaja.getHuoltajuusAlku()).isEqualTo(LocalDate.of(2012, 8, 2));
        assertThat(huoltaja.getHuoltajuusLoppu()).isEqualTo(LocalDate.of(2030, 8, 1));
    }

    @Test
    public void saveMuutostietoRemovesAndAddsHuoltaja() throws Exception {
        Henkilo oldHuoltaja = Henkilo.builder()
                .etunimet("Henriikka")
                .sukunimi("Hui Lai Lee Tes")
                .kansalaisuus(Set.of(new Kansalaisuus("152")))
                .hetu("140891-9642")
                .yhteystiedotRyhma(Set.of())
                .huoltajat(Set.of())
                .oidHenkilo("1.2.3.4.5")
                .build();
        Optional<Henkilo> henkiloWithHuoltaja = Optional.of(Henkilo.builder()
                .etunimet("etu")
                .sukunimi("suku")
                .kansalaisuus(Set.of(new Kansalaisuus("152")))
                .hetu(hetus.get(0))
                .yhteystiedotRyhma(Set.of())
                .huoltajat(Set.of(new HenkiloHuoltajaSuhde(henkilo.get(), oldHuoltaja, LocalDate.of(1900, 1, 1), null,
                        null, null)))
                .oidHenkilo("1.2.3.4.5")
                .build());
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkiloWithHuoltaja);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoHuoltajanPoisto.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getHuoltajat()).hasSize(2);
        Iterator<HuoltajaCreateDto> iter = actual.getHuoltajat().iterator();
        HuoltajaCreateDto huoltaja1 = iter.next();
        assertThat(huoltaja1.getHetu()).isNull();
        assertThat(huoltaja1.getEtunimet()).isEqualTo("Paola Peppina");
        assertThat(huoltaja1.getKutsumanimi()).isEqualTo("Paola Peppina");
        assertThat(huoltaja1.getSukunimi()).isEqualTo("Weitsell Tes");
        assertThat(huoltaja1.getSyntymaaika()).isEqualTo(LocalDate.of(2000, 11, 22));
        assertThat(huoltaja1.getHuoltajuusAlku()).isEqualTo(LocalDate.of(2020, 5, 14));
        assertThat(huoltaja1.getHuoltajuusLoppu()).isEqualTo(LocalDate.of(2036, 12, 30));
        HuoltajaCreateDto huoltaja2 = iter.next();
        assertThat(huoltaja2.getHetu()).isEqualTo("100391-9566");
        assertThat(huoltaja2.getEtunimet()).isEqualTo("Lina Margretha");
        assertThat(huoltaja2.getKutsumanimi()).isEqualTo("Lina Margretha");
        assertThat(huoltaja2.getSukunimi()).isEqualTo("Stenman Tes");
        assertThat(huoltaja2.getSyntymaaika()).isEqualTo(LocalDate.of(1994, 10, 11));
        assertThat(huoltaja2.getHuoltajuusAlku()).isEqualTo(LocalDate.of(2020, 5, 14));
        assertThat(huoltaja2.getHuoltajuusLoppu()).isEqualTo(LocalDate.of(2036, 12, 30));
    }

    @Test
    public void saveMuutostietoSavesFixedKansalaisuus() throws Exception {
        when(henkiloRepository.findByHetu(hetus.get(0))).thenReturn(henkilo);
        VtjMuutostieto muutostieto = getMuutostieto("/vtj/muutostietoKansalaisuusVanhaSudan.json");
        muutostietoService.updateHenkilo(muutostieto);
        verify(muutostietoRepository, times(1)).save(any());

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi())
                .collect(Collectors.toSet()))
                .isEqualTo(Set.of("729"));
    }
}
