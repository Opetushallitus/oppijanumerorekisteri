package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.*;

public class TurvakiellollisenKotikuntahistoriaTest extends VtjMuutostietoTestBase {
    private static final String KUNTA_HELSINKI = "091";
    private static final String KUNTA_JAMSA = "182";

    @Autowired
    private HenkiloService henkiloService;

    @Before
    public void before() {
        defaultKoodistoMocks(koodistoService);
    }

    @Test
    public void kotikuntahistoriaTurvakiellolliselle() throws Exception {
        var dbState = transactionTemplate.execute(status -> {
            var h = henkiloRepository.save(makeHenkilo().kotikunta(KUNTA_JAMSA).build());
            addKotikuntahistoria(h, KUNTA_JAMSA, LocalDate.of(2015, 1, 1), null);
            return h;
        });
        var apiResponse = henkiloService.getByHetu(dbState.getHetu());

        assertThat(dbState.getTurvakielto()).isEqualTo(false);
        assertThat(dbState.getKotikunta()).isEqualTo(KUNTA_JAMSA);
        assertThat(apiResponse.getKotikunta()).isEqualTo(KUNTA_JAMSA);
        assertKotikuntaHistoria(dbState,
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), null));
        assertTurvakieltoKotikuntaHistoria(dbState);

        dbState = applyMuutostieto(getMuutostieto(dbState.getHetu(), objectMapper.readTree("""
                      [
                          {"kuntakoodi": "091", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATTY"},
                          {"kuntakoodi": "182", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2015-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "MUUTETTU", "kunnastaPoisMuuttopv": {"arvo": "2015-12-31", "tarkkuus": "PAIVA"}}
                      ]
                """)));
        apiResponse = henkiloService.getByHetu(dbState.getHetu());

        assertThat(dbState.getTurvakielto()).isFalse();
        assertThat(apiResponse.getTurvakielto()).isFalse();
        assertThat(dbState.getKotikunta()).isEqualTo(KUNTA_HELSINKI);
        assertThat(apiResponse.getKotikunta()).isEqualTo(KUNTA_HELSINKI);
        assertKotikuntaHistoria(dbState,
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), null));
        assertTurvakieltoKotikuntaHistoria(dbState);

        dbState = applyMuutostieto(getMuutostieto(dbState.getHetu(), objectMapper.readTree("""
                      [{"tietoryhma": "TURVAKIELTO", "turvaLoppuPv": {"arvo": "2099-12-31", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATTY", "turvakieltoAktiivinen": true}]
                """)));
        apiResponse = henkiloService.getByHetu(dbState.getHetu());
        assertThat(dbState.getTurvakielto()).isTrue();
        assertThat(apiResponse.getTurvakielto()).isTrue();
        assertThat(dbState.getKotikunta()).isEqualTo(KUNTA_HELSINKI);
        assertThat(apiResponse.getKotikunta()).isNull();
        assertKotikuntaHistoria(dbState);
        assertTurvakieltoKotikuntaHistoria(dbState,
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), null));

        dbState = applyMuutostieto(getMuutostieto(dbState.getHetu(), objectMapper.readTree("""
                      [
                          {"kuntakoodi": "182", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATTY"},
                          {"kuntakoodi": "091", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "MUUTETTU", "kunnastaPoisMuuttopv": {"arvo": "2016-12-31", "tarkkuus": "PAIVA"}}
                      ]
                """)));
        apiResponse = henkiloService.getByHetu(dbState.getHetu());
        assertThat(dbState.getTurvakielto()).isTrue();
        assertThat(apiResponse.getTurvakielto()).isTrue();
        assertThat(dbState.getKotikunta()).isEqualTo(KUNTA_JAMSA);
        assertThat(apiResponse.getKotikunta()).isNull();
        assertKotikuntaHistoria(dbState);
        assertTurvakieltoKotikuntaHistoria(dbState,
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), LocalDate.of(2016, 12, 31)),
                tuple(KUNTA_JAMSA, LocalDate.of(2017, 1, 1), null));

        // Muuton kunnasta Helsinki (091) kuntaan Jämsä (182) peruutus
        dbState = applyMuutostieto(getMuutostieto(dbState.getHetu(), objectMapper.readTree("""
                      [
                          {"kuntakoodi": "182", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "POISTETTU", "voimassaolevatTiedot": [{"kuntakoodi": "091", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}}]},
                          {"kuntakoodi": "091", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATIETO"},
                          {"kuntakoodi": "091", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "KORJATTAVA", "kunnastaPoisMuuttopv": {"arvo": "2016-12-31", "tarkkuus": "PAIVA"}},
                          {"kuntakoodi": "091", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "KORJATTU"}
                      ]
                """)));
        apiResponse = henkiloService.getByHetu(dbState.getHetu());
        assertThat(dbState.getTurvakielto()).isTrue();
        assertThat(apiResponse.getTurvakielto()).isTrue();
        assertThat(dbState.getKotikunta()).isEqualTo(KUNTA_HELSINKI);
        assertThat(apiResponse.getKotikunta()).isNull();
        assertKotikuntaHistoria(dbState);
        assertTurvakieltoKotikuntaHistoria(dbState,
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), null));
    }
}
