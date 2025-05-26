package fi.vm.sade.oppijanumerorekisteri.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import fi.vm.sade.oppijanumerorekisteri.services.impl.KoodistoMock;
import jakarta.transaction.Transactional;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.validation.BindException;

import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;

@RunWith(SpringRunner.class)
@SpringBootTest
@Sql("/sql/truncate_data.sql")
@Sql("/sql/test_data.sql")
@Transactional
public class VtjMuutostietoServiceTest extends VtjMuutostietoTestBase {
    List<String> hetus = List.of("123456-111A", "101010-010B");
    List<VtjMuutostieto> muutostietos;
    VtjPerustieto perustieto;
    VtjPerustieto turvakielto;
    VtjPerustieto foreign;
    VtjPerustieto henkilotunnusKorjaus;

    @Before
    public void before() throws Exception {
        defaultKoodistoMocks(koodistoService);
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

    }

    @Test
    public void savePerustieto() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        var actual = applyPerustieto(perustieto);

        assertThat(actual.getEtunimet()).isEqualTo("Mathilda Helena Sophie");
        assertThat(actual.getSukunimi()).isEqualTo("Aslan Tes");
        assertThat(actual.getSyntymaaika()).isEqualTo(LocalDate.of(1958, 1, 30));
        assertThat(actual.getSukupuoli()).isEqualTo("2");
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi()).collect(Collectors.toSet()))
                .isEqualTo(set("123", "456"));
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(actual.getKutsumanimi()).isEqualTo("Helena");
        assertThat(actual.getTurvakielto()).isFalse();
        assertThat(actual.getKotikunta()).isEqualTo("091");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi4", "yhteystietotyyppi8", "yhteystietotyyppi11");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals(KoodistoMock.ALKUPERA_VTJ));
        for (var ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi4":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(Yhteystieto::getYhteystietoTyyppi, Yhteystieto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00780"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Öljymäki 11 C 3"));
                    break;
                case "yhteystietotyyppi8":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(Yhteystieto::getYhteystietoTyyppi, Yhteystieto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, "helena@miukumauku.fi"));
                    break;
                case "yhteystietotyyppi11":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(Yhteystieto::getYhteystietoTyyppi, Yhteystieto::getYhteystietoArvo)
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

        assertKotikuntaHistoria(henkilo,
                tuple("049", LocalDate.of(1994, 1, 1), LocalDate.of(1996, 3, 21)),
                tuple("091", LocalDate.of(1996, 3, 22), LocalDate.of(2001, 7, 8)),
                tuple("200", LocalDate.of(2001, 7, 9), LocalDate.of(2012, 10, 27)),
                tuple("049", LocalDate.of(2012, 10, 28), LocalDate.of(2019, 5, 3)),
                tuple("091", LocalDate.of(2019, 5, 4), null));
        assertTurvakieltoKotikuntaHistoria(henkilo);
    }

    @Test
    public void savePerustietoOverridesExistingKotikuntaHistoria() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        addKotikuntahistoria(henkilo, "321", LocalDate.of(2013, 3, 12), null);

        applyPerustieto(perustieto);

        assertKotikuntaHistoria(henkilo,
                tuple("049", LocalDate.of(1994, 1, 1), LocalDate.of(1996, 3, 21)),
                tuple("091", LocalDate.of(1996, 3, 22), LocalDate.of(2001, 7, 8)),
                tuple("200", LocalDate.of(2001, 7, 9), LocalDate.of(2012, 10, 27)),
                tuple("049", LocalDate.of(2012, 10, 28), LocalDate.of(2019, 5, 3)),
                tuple("091", LocalDate.of(2019, 5, 4), null));
        assertTurvakieltoKotikuntaHistoria(henkilo);
    }

    @Test
    public void savePerustietoParsesTurvakielto() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        Mockito.reset(henkiloRepository);
        addKotikuntahistoria(henkilo, "123", LocalDate.of(2015, 3, 12), null);

        var actual = applyPerustieto(turvakielto);
        var apiResponse = henkiloService.getByHetu(henkilo.getHetu());
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(actual.getTurvakielto()).isTrue();
        assertThat(actual.getKotikunta()).isEqualTo("091");
        assertThat(apiResponse.getKotikunta()).isNull();
        assertThat(actual.getYhteystiedotRyhma()).isEmpty();

        assertKotikuntaHistoria(henkilo);
        assertTurvakieltoKotikuntaHistoria(henkilo,
                tuple("123", LocalDate.of(2015, 3, 12), LocalDate.of(2019, 5, 3)),
                tuple("091", LocalDate.of(2019, 5, 4), null));
    }

    @Test
    public void savePerustietoParsesForeign() throws Exception {
        henkiloRepository.save(makeHenkilo().build());
        Mockito.reset(henkiloRepository);
        var actual = applyPerustieto(foreign);
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi()).collect(Collectors.toSet()))
                .isEqualTo(set("250"));
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("fr");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi5", "yhteystietotyyppi9");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals(KoodistoMock.ALKUPERA_VTJ));
        for (var ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi9":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(Yhteystieto::getYhteystietoTyyppi, Yhteystieto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "HELSINKI"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "00780"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Öljymäki 11 C 3"));
                    break;
                case "yhteystietotyyppi5":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(Yhteystieto::getYhteystietoTyyppi, Yhteystieto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "123 le street"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KUNTA, "Paris"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""));
                    break;
                default:
                    throw new Exception("invalid ryhmakuvaus " + ryhma.getRyhmaKuvaus());
            }
        }
    }

    private Iterator<HenkiloHuoltajaSuhde> huoltajatInConsistentOrder(Henkilo henkilo) {
        return henkilo.getHuoltajat().stream()
                .sorted(Comparator.comparing(suhde -> suhde.getHuoltaja().getId()))
                .iterator();
    }

    @Test
    public void savePerustietoParsesHuoltaja() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        var actual = applyPerustieto(new VtjPerustieto(henkilo.getHetu(), objectMapper.readTree(new File("src/test/resources/vtj/perustietoHuoltaja.json"))));

        assertThat(actual.getHuoltajat()).hasSize(2);
        var iter = huoltajatInConsistentOrder(actual);
        var suhde1 = iter.next();
        var huoltaja1 = suhde1.getHuoltaja();
        assertThat(huoltaja1.getHetu()).isEqualTo("220271-949R");
        assertThat(huoltaja1.getEtunimet()).isEqualTo("Leo Albert");
        assertThat(huoltaja1.getKutsumanimi()).isEqualTo("Leo Albert");
        assertThat(huoltaja1.getSukunimi()).isEqualTo("Lukkari Tes");
        assertThat(huoltaja1.getSyntymaaika()).isEqualTo(LocalDate.of(1971, 2, 22));//.isEqualTo(LocalDate.of(2001, 1, 1)); // FIXME: Parsittu hetusta eikä VTJ-muutostiedosta
        assertThat(suhde1.getAlkuPvm()).isEqualTo(LocalDate.of(2020, 3, 25));
        assertThat(suhde1.getLoppuPvm()).isEqualTo(LocalDate.of(2036, 1, 1));
        var suhde2 = iter.next();
        var huoltaja2 = suhde2.getHuoltaja();
        assertThat(huoltaja2.getHetu()).isEqualTo("111075-9782");
        assertThat(huoltaja2.getEtunimet()).isEqualTo("Chira Sabine");
        assertThat(huoltaja2.getKutsumanimi()).isEqualTo("Chira Sabine");
        assertThat(huoltaja2.getSukunimi()).isEqualTo("Karlsson Tes");
        assertThat(huoltaja2.getSyntymaaika()).isEqualTo(LocalDate.of(1975, 10, 11));//.isEqualTo(LocalDate.of(2001, 2, 15)); // FIXME: Parsittu hetusta eikä VTJ-muutostiedosta
        assertThat(suhde2.getAlkuPvm()).isEqualTo(LocalDate.of(2020, 3, 25));
        assertThat(suhde2.getLoppuPvm()).isEqualTo(LocalDate.of(2036, 1, 1));
    }

    @Test
    public void savePerustietoHandlesHenkilotunnusKorjaus() throws Exception {
        henkiloRepository.save(makeHenkilo().build());
        Mockito.reset(henkiloRepository);
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
        assertThat(muutostietoRepository.findAll()).containsExactlyInAnyOrderElementsOf(muutostietos);
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
        assertThat(muutostietoRepository.findAll()).containsExactlyInAnyOrderElementsOf(muutostietos);
    }

    @Test
    public void saveMuutostietoDoesNotSaveIfHenkiloIsPassivoitu() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().passivoitu(true).build());
        VtjMuutostieto muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoEtunimenmuutos.json");
        applyMuutostieto(muutostieto);

        verify(henkiloModificationService, times(0)).forceUpdateHenkilo(any());
    }

    @Test
    public void saveMuutostietoSetsMuutostietoErrorIfValidationFails() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        doThrow(new UnprocessableEntityException(new BindException(new HenkiloForceUpdateDto(), "henkiloForceUpdateDto")))
                .when(henkiloModificationService).forceUpdateHenkilo(any());
        applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoEtunimenmuutos.json"));

        var actual = muutostietoRepository.findAll();
        assertThat(actual).hasSize(1);
        assertThat(actual).allMatch(wasProcessedWithError());
    }

    @Test
    public void skipsUnprocessedForHenkiloIfPriorMuutostietoCanNotBeProcessed() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        var failingMuutostietoIndex = 5;
        IntStream.range(0, 10).forEach(i -> createAndSaveMuutostietoFor(henkilo));

        failToProcessMuutostietoNumber(failingMuutostietoIndex);
        muutostietoService.handleMuutostietoTask();

        var actual = muutostietoRepository.findAllByHenkilotunnusOrderByMuutospvAsc(henkilo.getHetu());
        assertThat(actual).hasSize(10);
        assertThat(actual.stream().limit(failingMuutostietoIndex - 1)).allMatch(wasProcessedWithoutError());
        assertThat(actual.stream().skip(failingMuutostietoIndex - 1).findFirst().get()).matches(wasProcessedWithError());
        assertThat(actual.stream().skip(failingMuutostietoIndex)).allMatch(wasNotProcessed());
    }

    @Test
    public void retriesMuutostietoThatCouldNotBeProcessedInAPriorBatch() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        createAndSaveMuutostietoThatFailedToProcessFor(henkilo);
        IntStream.range(0, 10).forEach(i -> createAndSaveMuutostietoFor(henkilo));

        muutostietoService.handleMuutostietoTask();

        var actual = muutostietoRepository.findAllByHenkilotunnusOrderByMuutospvAsc(henkilo.getHetu());
        assertThat(actual).hasSize(11);
        assertThat(actual).allMatch(wasProcessedWithoutError());
    }

    @Test
    public void doesNotSkipMuutostietoForHenkiloUnaffectedByPriorProcessingError() {
        var henkiloAffectedByProcessingError = henkiloRepository.save(makeHenkilo().build());
        var henkiloNotAffectedByProcessingError = henkiloRepository.save(makeHenkilo()
                .oidHenkilo("1.2.3.4.6")
                .hetu("123456-111B")
                .kaikkiHetut(set(("123456-111B")))
                .build());
        IntStream.range(0, 20).forEach(i -> createAndSaveMuutostietoFor(i % 2 == 0 ? henkiloAffectedByProcessingError : henkiloNotAffectedByProcessingError));
        failToProcessMuutostietoNumber(1);

        muutostietoService.handleMuutostietoTask();

        var actual1 = muutostietoRepository.findAllByHenkilotunnusOrderByMuutospvAsc(henkiloNotAffectedByProcessingError.getHetu());
        assertThat(actual1).hasSize(10);
        assertThat(actual1).allMatch(wasProcessedWithoutError());

        var actual2 = muutostietoRepository.findAllByHenkilotunnusOrderByMuutospvAsc(henkiloAffectedByProcessingError.getHetu());
        assertThat(actual2).hasSize(10);
        assertThat(actual2.stream().findFirst().get()).matches(wasProcessedWithError());
        assertThat(actual2.stream().skip(1)).allMatch(wasNotProcessed());
    }

    private Predicate<VtjMuutostieto> wasProcessedWithoutError() {
        return m -> Boolean.FALSE == m.getError() && m.getProcessed() != null;
    }

    private Predicate<VtjMuutostieto> wasProcessedWithError() {
        return m -> Boolean.TRUE == m.getError() && m.getProcessed() != null;
    }

    private Predicate<VtjMuutostieto> wasNotProcessed() {
        return m -> Boolean.FALSE == m.getError() && m.getProcessed() == null;
    }

    private void failToProcessMuutostietoNumber(int n) {
        var counter = new AtomicInteger(0);
        doAnswer(invocation -> {
            int callNumber = counter.incrementAndGet();

            if (callNumber == n) {
                throw new UnprocessableEntityException(new BindException(new HenkiloForceUpdateDto(), "henkiloForceUpdateDto"));
            } else {
                return invocation.callRealMethod();
            }
        }).when(henkiloModificationService).forceUpdateHenkilo(any());
    }

    private void createAndSaveMuutostietoThatFailedToProcessFor(Henkilo henkilo) {
        var muutostieto = createAndSaveMuutostietoFor(henkilo);
        muutostieto.setError(true);
        muutostieto.setProcessed(LocalDateTime.now());
        muutostietoRepository.save(muutostieto);
    }

    private VtjMuutostieto createAndSaveMuutostietoFor(Henkilo henkilo) {
        try {
            var muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoEtunimenmuutos.json");
            muutostietoRepository.save(muutostieto);

            return muutostieto;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void saveMuutostietoSavesEtunimenmuutos() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        VtjMuutostieto muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoEtunimenmuutos.json");
        applyMuutostieto(muutostieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getEtunimet()).isEqualTo("Mathilda Helena Sophie");
        assertThat(actual.getSukunimi()).isEqualTo("Aslan Tes");
    }

    @Test
    public void saveMuutostietoSavesHenkilotunnusmuutos() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo()
                .hetu("010568-998D")
                .kaikkiHetut(set("010568-998D"))
                .build());
        var actual = applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoHenkilotunnusmuutos.json"));
        assertThat(actual.getHetu()).isEqualTo("010869-9983");
        // FIXME: assertThat(actual.getKaikkiHetut()).containsExactlyInAnyOrder("010869-9983", "010568-998D");
    }

    @Test
    public void saveMuutostietoSavesSukupuolenmuutos() throws Exception {
        var before = henkiloRepository.save(makeHenkilo().hetu("021086-903N").kaikkiHetut(set("021086-903N")).build());
        var after = applyMuutostieto(getMuutostieto(before.getHetu(), "/vtj/muutostietoSukupuolenmuutos.json"));
        assertThat(after.getSukupuoli()).isEqualTo("2");
        assertThat(after.getHetu()).isEqualTo("021086-998R");
        // FIXME: assertThat(after.getKaikkiHetut()).containsExactlyInAnyOrder("021086-903N", "021086-998R");
    }

    @Test
    public void saveMuutostietoSavesSukunimenmuutos() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        VtjMuutostieto muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoSukunimenmuutos.json");
        applyMuutostieto(muutostieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getEtunimet()).isEqualTo("Kurt Helge");
        assertThat(actual.getSukunimi()).isEqualTo("von Olme-Tes");
    }

    @Test
    public void saveMuutostietoSavesKutsumanimenmuutos() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo()
                .etunimet("Mathilda Helena Sophie")
                .sukunimi("Aslan Tes")
                .build());
        VtjMuutostieto muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoKutsumanimenmuutos.json");
        applyMuutostieto(muutostieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKutsumanimi()).isEqualTo("Helena");
    }

    @Test
    public void saveMuutostietoSavesKuolema() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        VtjMuutostieto muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoKuolema.json");
        applyMuutostieto(muutostieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKuolinpaiva()).isEqualTo(LocalDate.of(2019, 6, 6));
    }

    @Test
    public void saveMuutostietoSavesKuolinpaivanPoisto() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        VtjMuutostieto muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoKuolinpaivanPoisto.json");
        applyMuutostieto(muutostieto);

        ArgumentCaptor<HenkiloForceUpdateDto> argument = ArgumentCaptor.forClass(HenkiloForceUpdateDto.class);
        verify(henkiloModificationService, times(1)).forceUpdateHenkilo(argument.capture());
        HenkiloForceUpdateDto actual = argument.getValue();
        assertThat(actual.getKuolinpaiva()).isNull();
    }

    @Test
    public void saveMuutostietoSavesKunnastaToiseenMuutto() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().kotikunta("091").build());
        addKotikuntahistoria(henkilo, "091", LocalDate.of(2004, 5, 1), null);

        var actual = applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoKunnastaToiseenMuutto.json"));
        assertThat(actual.getKotikunta()).isEqualTo("287");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi4");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals(KoodistoMock.ALKUPERA_VTJ));
        for (YhteystiedotRyhma ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi4":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(Yhteystieto::getYhteystietoTyyppi, Yhteystieto::getYhteystietoArvo)
                            .containsExactlyInAnyOrder(
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, ""),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, "MYRKKY"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, "64370"),
                                    tuple(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, "Gabriella 6a-6b A 2 a"));
                    break;
            }
        }

        assertKotikuntaHistoria(henkilo,
                tuple("091", LocalDate.of(2004, 5, 1), LocalDate.of(2019, 6, 26)),
                tuple("287", LocalDate.of(2019, 6, 27), null));
        assertTurvakieltoKotikuntaHistoria(henkilo);
    }

    @Test
    public void handleKotikuntaPoistettuMuutostieto() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo2().kotikunta("049").build());
        addKotikuntahistoria(henkilo, "091", LocalDate.of(2020, 1, 1), LocalDate.of(2023, 12, 31));
        addKotikuntahistoria(henkilo, "049", LocalDate.of(2024, 1, 1), null);

        assertKotikuntaHistoria(
                henkilo,
                tuple("091", LocalDate.of(2020, 1, 1), LocalDate.of(2023, 12, 31)),
                tuple("049", LocalDate.of(2024, 1, 1), null)
        );
        assertTurvakieltoKotikuntaHistoria(henkilo);

        var actual = applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoKotikunnanPoisto.json"));
        assertThat(actual.getKotikunta()).isEqualTo("091");
        assertKotikuntaHistoria(
                henkilo,
                tuple("091", LocalDate.of(2020, 1, 1), LocalDate.of(2023, 12, 31))
        );
        assertTurvakieltoKotikuntaHistoria(henkilo);
    }

    @Test
    public void saveMuutostietoSavesKansalaisuus() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        var actual = applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoKansalaisuudenLisaysJaPassivointi.json"));
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi())
                .collect(Collectors.toSet()))
                .isEqualTo(set("246"));
    }

    @Test
    public void saveMuutostietoSavesPostiosoitteenmuutos() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        var actual = applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoPostiosoitteenmuutos.json"));
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaKuvaus)
                .containsExactlyInAnyOrder("yhteystietotyyppi11");
        assertThat(actual.getYhteystiedotRyhma()).extracting(YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> alkupera.equals(KoodistoMock.ALKUPERA_VTJ));
        for (YhteystiedotRyhma ryhma : actual.getYhteystiedotRyhma()) {
            switch (ryhma.getRyhmaKuvaus()) {
                case "yhteystietotyyppi11":
                    assertThat(ryhma.getYhteystieto())
                            .extracting(Yhteystieto::getYhteystietoTyyppi, Yhteystieto::getYhteystietoArvo)
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
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        VtjMuutostieto muutostieto = getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoAidinkieli.json");
        var actual = applyMuutostieto(muutostieto);
        assertThat(actual.getAidinkieli().getKieliKoodi()).isEqualTo("98");
    }

    @Test
    public void saveMuutostietoSavesNewHuoltaja() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo().build());
        var actual = applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoHuoltosuhteenmuutos.json"));

        assertThat(actual.getHuoltajat()).hasSize(1);
        var suhde = huoltajatInConsistentOrder(actual).next();
        var huoltaja = suhde.getHuoltaja();
        assertThat(huoltaja.getHetu()).isEqualTo("280790-9696");
        assertThat(huoltaja.getEtunimet()).isEqualTo("Henriikka Sandra");
        assertThat(huoltaja.getKutsumanimi()).isEqualTo("Henriikka Sandra");
        assertThat(huoltaja.getSukunimi()).isEqualTo("Valkeavirta Tes");
        assertThat(huoltaja.getSyntymaaika()).isEqualTo(LocalDate.of(1990, 7, 28));//.isEqualTo(LocalDate.of(1984, 6, 1)); // FIXME: Tää on parsittu hetusta eikä VTJ-muutostiedosta
        assertThat(suhde.getAlkuPvm()).isEqualTo(LocalDate.of(2012, 8, 2));
        assertThat(suhde.getLoppuPvm()).isEqualTo(LocalDate.of(2030, 8, 1));
    }

    @Test
    public void saveMuutostietoUpdatesCurrentHuoltaja() throws Exception {
        var huoltajaEntity = henkiloRepository.save(makeHenkilo()
                .etunimet("huol")
                .sukunimi("taja")
                .hetu("280790-9696")
                .kaikkiHetut(set("280790-9696"))
                .yhteystiedotRyhma(set())
                .huoltajat(set())
                .oidHenkilo("1.2.3.4.5.huoltaja")
                .build());
        var huollettava = makeHenkilo().build();
        huollettava.getHuoltajat().add(new HenkiloHuoltajaSuhde(huollettava, huoltajaEntity, LocalDate.of(1900, 1, 1), null, null, null));
        huollettava = henkiloRepository.save(huollettava);

        var actual = applyMuutostieto(getMuutostieto(huollettava.getHetu(), "/vtj/muutostietoHuoltosuhteenmuutos.json"));
        assertThat(actual.getHuoltajat()).hasSize(1);
        var suhde = huoltajatInConsistentOrder(actual).next();
        var huoltaja = suhde.getHuoltaja();
        assertThat(huoltaja.getHetu()).isEqualTo("280790-9696");
        assertThat(huoltaja.getEtunimet()).isEqualTo("huol");//.isEqualTo("Henriikka Sandra"); // FIXME: Ei päivity HUOLTAJA tietoryhmän tiedoilla
        assertThat(huoltaja.getKutsumanimi()).isEqualTo("etu");//.isEqualTo("Henriikka Sandra"); // FIXME: Ei päivity HUOLTAJA tietoryhmän tiedoilla
        assertThat(huoltaja.getSukunimi()).isEqualTo("taja"); //.isEqualTo("Valkeavirta Tes"); // FIXME: Ei päivity HUOLTAJA tietoryhmän tiedoilla
        assertThat(huoltaja.getSyntymaaika()).isEqualTo(LocalDate.of(1990, 7, 28));//.isEqualTo(1984, 6, 1); // FIXME: Parsitaan hetusta, ei lueta HUOLTAJA tietoryhmästä
        assertThat(suhde.getAlkuPvm()).isEqualTo(LocalDate.of(2012, 8, 2)); // FIXME: Ei vastaa VTJ-muutostietoa
        assertThat(suhde.getLoppuPvm()).isEqualTo(LocalDate.of(2030, 8, 1)); // FIXME: Ei vastaa VTJ-muutostietoa
    }

    @Test
    public void saveMuutostietoRemovesAndAddsHuoltaja() throws Exception {
        Henkilo oldHuoltaja = henkiloRepository.save(makeHenkilo()
                .etunimet("Henriikka")
                .sukunimi("Hui Lai Lee Tes")
                .hetu("140891-9642")
                .kaikkiHetut(set("140891-9642"))
                .yksiloityVTJ(true)
                .oidHenkilo("1.2.3.4.5.huoltaja")
                .build());
        Henkilo henkiloWithHuoltaja = makeHenkilo()
                .etunimet("etu")
                .sukunimi("suku")
                .hetu(hetus.get(0))
                .kaikkiHetut(set(hetus.get(0)))
                .yksiloityVTJ(true)
                .oidHenkilo("1.2.3.4.5.huollettava")
                .build();
        henkiloWithHuoltaja.getHuoltajat().add(new HenkiloHuoltajaSuhde(henkiloWithHuoltaja, oldHuoltaja, LocalDate.of(1900, 1, 1), null, null, null));
        henkiloWithHuoltaja = henkiloRepository.save(henkiloWithHuoltaja);

        var actual = applyMuutostieto(getMuutostieto(henkiloWithHuoltaja.getHetu(), "/vtj/muutostietoHuoltajanPoisto.json"));
        assertThat(actual.getHuoltajat()).hasSize(2);
        var iter = huoltajatInConsistentOrder(actual);
        var suhde1 = iter.next();
        var huoltaja1 = suhde1.getHuoltaja();
        assertThat(huoltaja1.getHetu()).isNull();
        assertThat(huoltaja1.getEtunimet()).isEqualTo("Paola Peppina");
        assertThat(huoltaja1.getKutsumanimi()).isEqualTo("Paola Peppina");
        assertThat(huoltaja1.getSukunimi()).isEqualTo("Weitsell Tes");
        assertThat(huoltaja1.getSyntymaaika()).isEqualTo(LocalDate.of(2000, 11, 22));
        assertThat(suhde1.getAlkuPvm()).isEqualTo(LocalDate.of(2020, 5, 14));
        assertThat(suhde1.getLoppuPvm()).isEqualTo(LocalDate.of(2036, 12, 30));
        var suhde2 = iter.next();
        var huoltaja2 = suhde2.getHuoltaja();
        assertThat(huoltaja2.getHetu()).isEqualTo("100391-9566");
        assertThat(huoltaja2.getEtunimet()).isEqualTo("Lina Margretha");
        assertThat(huoltaja2.getKutsumanimi()).isEqualTo("Lina Margretha");
        assertThat(huoltaja2.getSukunimi()).isEqualTo("Stenman Tes");
        assertThat(huoltaja2.getSyntymaaika()).isEqualTo(LocalDate.of(1991, 3, 10)); //.isEqualTo(LocalDate.of(1994, 10, 11)); // FIXME: Parsittu hetusta eikä VTJ-tiedoista
        assertThat(suhde2.getAlkuPvm()).isEqualTo(LocalDate.of(2020, 5, 14));
        assertThat(suhde2.getLoppuPvm()).isEqualTo(LocalDate.of(2036, 12, 30));
    }

    @Test
    public void saveMuutostietoSavesFixedKansalaisuus() throws Exception {
        var henkilo = henkiloRepository.save(makeHenkilo2().build());
        var actual = applyMuutostieto(getMuutostieto(henkilo.getHetu(), "/vtj/muutostietoKansalaisuusVanhaSudan.json"));
        assertThat(actual.getKansalaisuus().stream().map(k -> k.getKansalaisuusKoodi())
                .collect(Collectors.toSet()))
                .isEqualTo(set("729"));
    }
}
