package fi.vm.sade.oppijanumerorekisteri.api;

import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@JsonTest
@ContextConfiguration(classes = OppijanumerorekisteriServiceApplication.class)
public class HenkiloJsonTest {
    @Autowired
    private JacksonTester<HenkiloDto> henkiloDtoJson;

    @Autowired
    private JacksonTester<HenkilonYhteystiedotViewDto> yhteystiedotJson;

    @Test
    public void testHenkiloDtoSerialize() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        assertThat(this.henkiloDtoJson.write(henkiloDto)).isEqualToJson("/henkilo/testHenkiloDto.json");
    }

    @Test
    public void testHenkiloDtoDeserialize() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        assertThat(this.henkiloDtoJson.read("/henkilo/testHenkiloDto.json").getObject())
                .usingRecursiveComparison().isEqualTo(henkiloDto);
    }

    @Test
    public void testHenkiloDtoDeserializeEidas() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("Leon Elias", "Leon Elias", "Germany", null, "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "+49 69 1234 5678");
        henkiloDto.setYksiloityEidas(true);
        henkiloDto.setEidasTunnisteet(List.of(EidasTunnisteDto.builder().tunniste("DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5").build()));
        var parsed = this.henkiloDtoJson.read("/henkilo/testHenkiloDto-eidas.json").getObject();
        assertThat(parsed).usingRecursiveComparison().isEqualTo(henkiloDto);
        assertThat(parsed.isYksiloityEidas()).isTrue();
        assertThat(parsed.getEidasTunnisteet()).hasSize(1);
    }

    @Test
    public void testHenkiloDtoDeserializePreEidas() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        var parsed = this.henkiloDtoJson.read("/henkilo/testHenkiloDto-noeidas.json").getObject();
        assertThat(parsed).usingRecursiveComparison().isEqualTo(henkiloDto);
        assertThat(parsed.isYksiloityEidas()).isFalse();
        assertThat(parsed.getEidasTunnisteet()).isEmpty();
    }

    @Test
    public void testSerializeYhteystiedot() throws IOException {
        HenkilonYhteystiedotViewDto dto = new HenkilonYhteystiedotViewDto()
                .put("yhteystietotyyppi1", YhteystiedotDto.builder()
                        .sahkoposti("testi@test.com")
                        .matkapuhelinnumero("+358451234567")
                        .katuosoite("Testikatu 2")
                        .kunta("Toijala")
                        .postinumero("12345")
                        .kaupunki("Toijala")
                        .maa("Suomi")
                    .build())
                .put("yhteystietotyyppi2", YhteystiedotDto.builder()
                        .sahkoposti("tyo@osoite.fi")
                        .puhelinnumero("01234567")
                        .matkapuhelinnumero("+3584040404")
                        .katuosoite("Työkatu 6")
                        .kunta("Vilppula")
                        .postinumero("54321")
                        .kaupunki("Vilppula")
                    .build());
        assertThat(this.yhteystiedotJson.write(dto))
                .isEqualToJson("/henkilo/testYhteystiedotViewDto.json");
    }

    private HenkiloDto createHenkiloDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                    boolean passivoitu, String kielikoodi, String kielityyppi,
                                    String kansalaisuuskoodi, String kasittelija, String yhteystietoArvo) {
        return HenkiloDto.builder()
                .oidHenkilo(oidHenkilo)
                .hetu(hetu)
                .kaikkiHetut(null)
                .passivoitu(passivoitu)
                .etunimet(etunimet)
                .kutsumanimi(kutsumanimi)
                .sukunimi(sukunimi)
                .aidinkieli(new KielisyysDto(kielikoodi, kielityyppi))
                .asiointiKieli(new KielisyysDto(kielikoodi, kielityyppi))
                .kansalaisuus(Collections.singleton(new KansalaisuusDto(kansalaisuuskoodi)))
                .kasittelijaOid(kasittelija)
                .syntymaaika(LocalDate.of(1970, Month.OCTOBER, 10))
                .sukupuoli("1")
                .kotikunta(null)
                .oppijanumero("1.2.3.4.5")
                .turvakielto(null)
                .eiSuomalaistaHetua(false)
                .yksiloity(false)
                .yksiloityVTJ(false)
                .yksilointiYritetty(false)
                .yksiloityEidas(false)
                .eidasTunnisteet(new ArrayList<>())
                .duplicate(false)
                .created(new Date(29364800000L))
                .modified(new Date(29364800000L))
                .vtjsynced(null)
                .yhteystiedotRyhma(Collections.singleton(
                        new YhteystiedotRyhmaDto(
                            1L,
                            "yhteystietotyyppi7",
                            "alkupera2",
                            true,
                            Collections.singleton(
                                new YhteystietoDto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo)))))
                .yksilointivirheet(new HashSet<>())
                .passinumerot(null)
                .build();
    }
}
