package fi.vm.sade.oppijanumerorekisteri.api;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.Month;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static fi.vm.sade.oppijanumerorekisteri.FilesystemHelper.getFixture;

@SpringBootTest
public class HenkiloJsonTest {
    @Autowired
    private ObjectMapper mapper;

    @Test
    public void testHenkiloDtoSerialize() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi", Set.of(), List.of());
        assertThat(mapper.writeValueAsString(henkiloDto)).isEqualTo(getFixture("/henkilo/testHenkiloDto.json"));
    }

    @Test
    public void testHenkiloDtoDeserialize() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi", Set.of(), List.of());
        assertThat(mapper.readValue(getFixture("/henkilo/testHenkiloDto.json"), HenkiloDto.class))
                .usingRecursiveComparison().isEqualTo(henkiloDto);
    }

    @Test
    public void testHenkiloDtoDeserializeEidas() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("Leon Elias", "Leon Elias", "Germany", null, "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "+49 69 1234 5678", null, null);
        henkiloDto.setYksiloityEidas(true);
        henkiloDto.setEidasTunnisteet(List.of(EidasTunnisteDto.builder().tunniste("DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5").build()));
        var parsed = mapper.readValue(getFixture("/henkilo/testHenkiloDto-eidas.json"), HenkiloDto.class);
        assertThat(parsed).usingRecursiveComparison().isEqualTo(henkiloDto);
        assertThat(parsed.isYksiloityEidas()).isTrue();
        assertThat(parsed.getEidasTunnisteet()).hasSize(1);
    }

    @Test
    public void testHenkiloDtoDeserializePreEidas() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi", null, null);
        var parsed = mapper.readValue(getFixture("/henkilo/testHenkiloDto-noeidas.json"), HenkiloDto.class);
        assertThat(parsed).usingRecursiveComparison().isEqualTo(henkiloDto);
        assertThat(parsed.isYksiloityEidas()).isFalse();
        assertThat(parsed.getEidasTunnisteet()).isNull();
    }

    private HenkiloDto createHenkiloDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                    boolean passivoitu, String kielikoodi, String kielityyppi,
                                    String kansalaisuuskoodi, String kasittelija, String yhteystietoArvo,
                                    Set<YksilointiVirheDto> yksilointivirheet, List<EidasTunnisteDto> eidasTunnisteet) {
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
                .eidasTunnisteet(eidasTunnisteet)
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
                .yksilointivirheet(yksilointivirheet)
                .passinumerot(null)
                .build();
    }
}
