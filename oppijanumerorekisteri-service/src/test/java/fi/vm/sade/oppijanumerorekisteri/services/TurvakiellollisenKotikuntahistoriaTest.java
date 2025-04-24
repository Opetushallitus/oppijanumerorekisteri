package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
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

    @Test
    public void kotikuntahistoriaTurvakiellolliselle() throws Exception {
        var TODAY = LocalDate.now();
        var YESTERDAY = TODAY.minusDays(1);
        when(koodistoService.list(Koodisto.KUNTA)).thenReturn(new KoodiTypeListBuilder(Koodisto.KUNTA)
                .koodi(KUNTA_HELSINKI)
                .koodi(KUNTA_JAMSA)
                .build());

        // Alkutilanne
        var before = henkiloRepository.save(makeHenkilo()
                .kotikunta(KUNTA_JAMSA)
                .build());
        kotikuntaHistoriaRepository.save(KotikuntaHistoria.builder()
                .henkiloId(before.getId())
                .kotikunta(KUNTA_JAMSA)
                .kuntaanMuuttopv(LocalDate.of(2015, 1, 1))
                .build());
        // Kotikuntahistoria
        //  - Jämsä (182) / 2015-01-01 ->
        assertThat(before.getTurvakielto()).isEqualTo(false);
        assertThat(before.getKotikunta()).isEqualTo(KUNTA_JAMSA);
        assertKotikuntaHistoria(before.getId(),
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), null));
        assertThat(henkiloService.getKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(1);
        assertThat(henkiloService.getTurvakieltoKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(0);

        // Muutto kunnasta Jämsä (182) kuntaan Helsinki (091)
        var updated = applyMuutostieto(getMuutostieto(before.getHetu(), objectMapper.readTree("""
                      [
                          {"kuntakoodi": "091", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATTY"},
                          {"kuntakoodi": "182", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2015-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "MUUTETTU", "kunnastaPoisMuuttopv": {"arvo": "2015-12-31", "tarkkuus": "PAIVA"}}
                      ]
                """)));
        // Kotikuntahistoria
        //  - Jämsä (182) / 2015-01-01 - 2015-12-31
        //  - Helsinki (091) / 2016-01-01 ->
        assertThat(updated.getTurvakielto()).isEqualTo(false);
        assertThat(updated.getKotikunta()).isEqualTo(KUNTA_HELSINKI);
        assertKotikuntaHistoria(before.getId(),
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), null));
        assertTurvakieltoKotikuntaHistoria(before.getId());
        assertThat(henkiloService.getKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(2);
        assertThat(henkiloService.getTurvakieltoKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(0);

        // Turvakielto aktivoidaan, jolloin kotikunta poistetaan ja historiaan merkitään muuttopäiväksi eilinen päivä
        updated = applyMuutostieto(getMuutostieto(before.getHetu(), objectMapper.readTree("""
                      [{"tietoryhma": "TURVAKIELTO", "turvaLoppuPv": {"arvo": "2029-08-22", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATTY", "turvakieltoAktiivinen": true}]
                """)));
        // Kotikuntahistoria oikeasti
        //  - Jämsä (182) / 2015-01-01 - 2015-12-31
        //  - Helsinki (091) / 2016-01-01 ->
        // Kotikuntahistoria tulkittuna
        //  - Jämsä (182) / 2015-01-01 - 2015-12-31
        //  - Helsinki (091) / 2016-01-01 - eilen
        // Kotikuntahistoria tulkittuna (turvakielto)
        //  - Helsinki (091) / tänään ->
        // KAIKKI OK!
        assertThat(updated.getTurvakielto()).isEqualTo(true);
        assertThat(updated.getKotikunta()).isNull();
        assertKotikuntaHistoria(before.getId(),
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), YESTERDAY));
        assertTurvakieltoKotikuntaHistoria(before.getId(),
                tuple(KUNTA_HELSINKI, TODAY, null));
        assertThat(henkiloService.getKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(2);
        assertThat(henkiloService.getTurvakieltoKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(1);

        // Muutto kunnasta Helsinki (091) kuntaan Jämsä (182)
        updated = applyMuutostieto(getMuutostieto(before.getHetu(), objectMapper.readTree("""
                      [
                          {"kuntakoodi": "182", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATTY"},
                          {"kuntakoodi": "091", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "MUUTETTU", "kunnastaPoisMuuttopv": {"arvo": "2016-12-31", "tarkkuus": "PAIVA"}}
                      ]
                """)));
        // Kotikuntahistoria oikeasti
        //  - Jämsä (182) / 2015-01-01 - 2015-12-31
        //  - Helsinki (091) / 2016-01-01 - 2016-12-31
        //  - Jämsä (182) / 2017-01-01 ->
        // Kotikuntahistoria tulkittuna
        //  - Jämsä (182) / 2015-01-01 - 2015-12-31
        //  - Helsinki (091) / 2016-01-01 - eilen
        // Kotikuntahistoria tulkittuna (turvakielto)
        //  - Helsinki (091) / tänään - 2016-12-31
        //  - Jämsä (182) / 2017-01-01 ->
        // FIXME: eilen/tänään ei oo oikein
        assertThat(updated.getTurvakielto()).isEqualTo(true);
        assertThat(updated.getKotikunta()).isNull();
        assertKotikuntaHistoria(before.getId(),
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), YESTERDAY));
        assertTurvakieltoKotikuntaHistoria(before.getId(),
                tuple(KUNTA_HELSINKI, TODAY, LocalDate.of(2016, 12, 31)),
                tuple(KUNTA_JAMSA, LocalDate.of(2017, 1, 1), null));
        assertThat(henkiloService.getKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(2);
        assertThat(henkiloService.getTurvakieltoKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(2);

        // Muuton kunnasta Helsinki (091) kuntaan Jämsä (182) peruutus
        updated = applyMuutostieto(getMuutostieto(before.getHetu(), objectMapper.readTree("""
                      [
                          {"kuntakoodi": "182", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2017-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "POISTETTU", "voimassaolevatTiedot": [{"kuntakoodi": "091", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}}]},
                          {"kuntakoodi": "091", "tietoryhma": "KOTIKUNTA", "kuntaanMuuttoPv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "LISATIETO"},
                          {"kuntakoodi": "091", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "KORJATTAVA", "kunnastaPoisMuuttopv": {"arvo": "2016-12-31", "tarkkuus": "PAIVA"}},
                          {"kuntakoodi": "091", "tietoryhma": "EDELLINEN_KOTIKUNTA", "kuntaanMuuttopv": {"arvo": "2016-01-01", "tarkkuus": "PAIVA"}, "muutosattribuutti": "KORJATTU"}
                      ]
                """)));
        // Kotikuntahistoria oikeasti
        //  - Jämsä (182) / 2015-01-01 - 2015-12-31
        //  - Helsinki (091) / 2016-01-01 ->
        // Kotikuntahistoria tulkittuna
        //  - Jämsä (182) / 2015-01-01 - 2015-12-31
        //  - Helsinki (091) / 2016-01-01 - eilen
        // Kotikuntahistoria tulkittuna (turvakielto)
        //  - Helsinki (091) / tänään - 2016-12-31
        //  - Jämsä (182) / 2017-01-01 ->
        // FIXME: ei löytynytkään riviä Helsinki (091) / 2016-01-01 - 2016-12-31, jonka korjata muotoon 2016-01-01 ->
        // FIXME: turvakieltolistaa ei tsekata?
        assertThat(updated.getTurvakielto()).isEqualTo(true);
        assertThat(updated.getKotikunta()).isNull();
        assertKotikuntaHistoria(before.getId(), // ei muutoksia turvakiellolliselle
                tuple(KUNTA_JAMSA, LocalDate.of(2015, 1, 1), LocalDate.of(2015, 12, 31)),
                tuple(KUNTA_HELSINKI, LocalDate.of(2016, 1, 1), YESTERDAY));
        assertTurvakieltoKotikuntaHistoria(before.getId(),
                tuple(KUNTA_HELSINKI, TODAY, LocalDate.of(2016, 12, 31)),
                tuple(KUNTA_JAMSA, LocalDate.of(2017, 1, 1), null));
        assertThat(henkiloService.getKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(2);
        assertThat(henkiloService.getTurvakieltoKotikuntaHistoria(List.of(before.getOidHenkilo()))).hasSize(2);
    }
}
