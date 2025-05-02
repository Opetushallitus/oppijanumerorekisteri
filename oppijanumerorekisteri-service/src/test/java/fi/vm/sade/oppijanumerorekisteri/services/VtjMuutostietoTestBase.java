package fi.vm.sade.oppijanumerorekisteri.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.impl.AwsSnsHenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.impl.KoodistoMock;
import org.assertj.core.groups.Tuple;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
@Sql("/sql/truncate_data.sql")
@Sql("/sql/test_data.sql")
abstract public class VtjMuutostietoTestBase implements KoodistoMock {
    @Autowired
    TransactionTemplate transactionTemplate;
    @Autowired
    protected OidGenerator oidGenerator;
    @Autowired
    protected HenkiloService henkiloService;
    @Autowired
    protected KielisyysRepository kielisyysRepository;
    @Autowired
    protected KansalaisuusRepository kansalaisuusRepository;
    @Autowired
    protected KotikuntaHistoriaRepository kotikuntaHistoriaRepository;
    @Autowired
    protected ObjectMapper objectMapper;
    @Autowired
    protected VtjMuutostietoService muutostietoService;
    @MockitoSpyBean
    protected HenkiloRepository henkiloRepository;
    @MockitoSpyBean
    protected HenkiloModificationService henkiloModificationService;
    @MockitoBean
    protected VtjMuutostietoKirjausavainRepository kirjausavainRepository;
    @MockitoBean
    protected AwsSnsHenkiloModifiedTopic henkiloModifiedTopic;
    @MockitoBean
    protected VtjMuutostietoClient muutostietoClient;
    @MockitoBean
    protected VtjMuutostietoRepository muutostietoRepository;
    @MockitoBean
    protected KoodistoService koodistoService;
    @MockitoBean
    protected SlackClient slackClient;


    protected <T> Set<T> set(T... items) {
        return new HashSet<>(Arrays.asList(items));
    }

    protected Henkilo.builder makeHenkilo() {
        var kielisyys = kielisyysRepository.findByKieliKoodi("fi").get();
        var kansalaisuus = kansalaisuusRepository.findByKansalaisuusKoodi("152").get();
        return Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .etunimet("etu")
                .sukunimi("suku")
                .kutsumanimi("etu")
                .kansalaisuus(set(kansalaisuus))
                .hetu("123456-111A")
                .kaikkiHetut(set(("123456-111A")))
                .aidinkieli(kielisyys)
                .yhteystiedotRyhma(new HashSet<>())
                .huoltajat(new HashSet<>())
                .created(new Date())
                .modified(new Date());
    }

    protected Henkilo.builder makeHenkilo2() {
        return Henkilo.builder()
                .etunimet("etu")
                .sukunimi("suku")
                .kutsumanimi("etu")
                .hetu("123456-111A")
                .kaikkiHetut(set(("123456-111A")))
                .kotikunta("123")
                .yhteystiedotRyhma(new HashSet(List.of(
                        new YhteystiedotRyhma("yhteystietotyyppi9", "alkupera1", false,
                                Set.of(new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE,
                                                "kadu osoite 123"),
                                        new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI,
                                                "hesa"),
                                        new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO,
                                                "12345"))),
                        new YhteystiedotRyhma("yhteystietotyyppi8", "alkupera1", false,
                                Set.of(new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI,
                                        "sahko@posti.fi"))))))
                .huoltajat(new HashSet<>())
                .created(new Date())
                .modified(new Date())
                .oidHenkilo("1.2.3.4.5");
    }

    protected void assertKotikuntaHistoria(Long henkiloId, Tuple... values) {
        var entries = kotikuntaHistoriaRepository.findAllByHenkiloId(henkiloId);
        assertThat(entries)
                .extracting(KotikuntaHistoria::getKotikunta, KotikuntaHistoria::getKuntaanMuuttopv, KotikuntaHistoria::getKunnastaPoisMuuttopv)
                .containsExactlyInAnyOrder(values);
        assertThat(entries).hasSize(values.length);
    }

    protected void addKotikuntahistoria(Henkilo h, String kunta, LocalDate kuntaanMuuttopv, LocalDate kunnastaPoisMuuttopv) {
        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                .henkiloId(h.getId())
                .kotikunta(kunta)
                .kuntaanMuuttopv(kuntaanMuuttopv)
                .kunnastaPoisMuuttopv(kunnastaPoisMuuttopv)
                .build());
    }

    protected VtjMuutostieto getMuutostieto(String hetu, String path) throws Exception {
        try (var is = getClass().getResourceAsStream(path)) {
            return getMuutostieto(hetu, objectMapper.readTree(is));
        }
    }

    protected VtjMuutostieto getMuutostieto(String hetu, JsonNode json) throws Exception {
        return new VtjMuutostieto(hetu, LocalDateTime.now(), json, null, false);
    }

    protected Henkilo applyPerustieto(VtjPerustieto perustieto) {
        muutostietoService.savePerustieto(perustieto);
        return henkiloRepository.findByHetu(perustieto.henkilotunnus).get();
    }

    protected Henkilo applyMuutostieto(VtjMuutostieto muutostieto) {
        // TODO: Actually use muutostietoService.handleMuutostietoTask();
        transactionTemplate.executeWithoutResult(status ->
            muutostietoService.updateHenkilo(muutostieto));
        return henkiloRepository.findByKaikkiHetut(muutostieto.getHenkilotunnus()).get();
    }
}
