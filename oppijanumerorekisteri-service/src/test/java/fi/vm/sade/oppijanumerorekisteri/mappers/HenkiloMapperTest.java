package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.EidasTunniste;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.time.Month;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

@RunWith(SpringRunner.class)
@SpringBootTest
public class HenkiloMapperTest {
    @Autowired
    private OrikaConfiguration modelmapper;

    @Test
    public void henkiloToHenkiloPerustietoDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        henkilo.setEidasTunnisteet(List.of(
                EidasTunniste.builder().tunniste("FOO/BAR/XYZ").created(ZonedDateTime.now()).createdBy("1.2.3.4.5").build(),
                EidasTunniste.builder().tunniste("FOO/BAR/123").created(ZonedDateTime.now()).createdBy("1.2.3.4.6").build()
        ));
        HenkiloPerustietoDto henkiloPerustietoDto = modelmapper.map(henkilo, HenkiloPerustietoDto.class);

        assertThat(henkiloPerustietoDto.getEtunimet()).isEqualTo("arpa");
        assertThat(henkiloPerustietoDto.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkiloPerustietoDto.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkiloPerustietoDto.getHetu()).isEqualTo("123456-9999");
        assertThat(henkiloPerustietoDto.getOidHenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKieliTyyppi()).isEqualTo("suomi");
        assertThat(henkiloPerustietoDto.getEidasTunnisteet())
                .extracting("tunniste")
                .containsExactlyInAnyOrder("FOO/BAR/XYZ", "FOO/BAR/123");
    }

    @Test
    public void henkiloPerustietoDtoToHenkilo() {
        LocalDate syntymaaika = LocalDate.of(2016, Month.DECEMBER, 20);
        HenkiloPerustietoDto henkiloPerustietoDto = new HenkiloPerustietoDto(
                "1.2.3.4.5",
                singletonList("externalid1"),
                emptyList(),
                "123456-9999",
                null,
                "arpa",
                "arpa",
                "kuutio",
                syntymaaika,
                false,
                new KielisyysDto("fi", "suomi"),
                null,
                Set.of(new KansalaisuusDto("246")),
                null,
                new Date()
        );
        Henkilo henkilo = modelmapper.map(henkiloPerustietoDto, Henkilo.class);
        assertThat(henkilo.getEtunimet()).isEqualTo("arpa");
        assertThat(henkilo.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkilo.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkilo.getHetu()).isEqualTo("123456-9999");
        assertThat(henkilo.getOidHenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkilo.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(henkilo.getAidinkieli().getKieliTyyppi()).isEqualTo("suomi");
    }

    @Test
    public void henkiloToHenkiloOidHetuNimiDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = modelmapper.map(henkilo, HenkiloOidHetuNimiDto.class);
        assertThat(henkiloOidHetuNimiDto.getEtunimet()).isEqualTo("arpa");
        assertThat(henkiloOidHetuNimiDto.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkiloOidHetuNimiDto.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkiloOidHetuNimiDto.getHetu()).isEqualTo("123456-9999");
        assertThat(henkiloOidHetuNimiDto.getOidHenkilo()).isEqualTo("1.2.3.4.5");
    }

    @Test
    public void henkiloOidHetuNimiDtoToHenkilo() {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = new HenkiloOidHetuNimiDto("1.2.3.4.5", "123456-9999", "arpa", "arpa", "kuutio");
        Henkilo henkilo = modelmapper.map(henkiloOidHetuNimiDto, Henkilo.class);
        assertThat(henkilo.getEtunimet()).isEqualTo("arpa");
        assertThat(henkilo.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkilo.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkilo.getHetu()).isEqualTo("123456-9999");
        assertThat(henkilo.getOidHenkilo()).isEqualTo("1.2.3.4.5");
    }

    @Test
    public void henkiloToHenkiloDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        henkilo.setPassinumerot(Set.of("passinumero"));
        HenkiloDto henkiloDto = modelmapper.map(henkilo, HenkiloDto.class);
        assertThat(henkiloDto).usingRecursiveComparison()
                .ignoringFields("serialVersionUID", "aidinkieli", "asiointiKieli", "kielisyys", "kansalaisuus", "yhteystiedotRyhma", "oppijanumero")
                .isEqualTo(henkilo);
        assertThat(henkiloDto.getAidinkieli()).usingRecursiveComparison()
                .ignoringFields("serialVersionUID")
                .isEqualTo(henkilo.getAidinkieli());
        assertThat(henkiloDto.getAsiointiKieli()).usingRecursiveComparison()
                .ignoringFields("serialVersionUID")
                .isEqualTo(henkilo.getAsiointiKieli());
        assertThat(henkiloDto.getKansalaisuus()).usingRecursiveFieldByFieldElementComparatorIgnoringFields("serialVersionUID")
                .isEqualTo(henkilo.getKansalaisuus());
        assertThat(henkiloDto.getPassinumerot()).isEqualTo(Set.of("passinumero"));

        assertThat(henkiloDto.getYhteystiedotRyhma().size()).isEqualTo(henkilo.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto())
                .isEqualTo(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto());
        assertThat(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus())
                .isEqualTo(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus());
        assertThat(henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().size())
                .isEqualTo(henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().size()).isEqualTo(1);
        YhteystietoDto yhteystietoDto = henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        Yhteystieto yhteystieto = henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        assertThat(yhteystietoDto).usingRecursiveComparison()
                .ignoringFields("serialVersionUID")
                .isEqualTo(yhteystieto);
    }

    @Test
    public void henkiloDtoToHenkilo() {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        Henkilo henkilo = modelmapper.map(henkiloDto, Henkilo.class);
        assertThat(henkilo).usingRecursiveComparison()
                .ignoringFields("serialVersionUID", "aidinkieli", "asiointiKieli", "kielisyys", "kansalaisuus", "yhteystiedotRyhma", "id", "version")
                .isEqualTo(henkilo);
        assertThat(henkilo.getAidinkieli()).usingRecursiveComparison()
                .ignoringFields("serialVersionUID", "henkilos", "id", "version")
                .isEqualTo(henkiloDto.getAidinkieli());
        assertThat(henkilo.getKansalaisuus()).usingRecursiveComparison()
                .ignoringFields("serialVersionUID", "henkilos", "id", "version")
                .isEqualTo(henkiloDto.getKansalaisuus());

        assertThat(henkilo.getYhteystiedotRyhma().size()).isEqualTo(henkiloDto.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto())
                .isEqualTo(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto());
        assertThat(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus())
                .isEqualTo(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus());
        assertThat(henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().size())
                .isEqualTo(henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().size()).isEqualTo(1);
        Yhteystieto yhteystieto = henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        YhteystietoDto yhteystietoDto = henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        assertThat(yhteystietoDto).usingRecursiveComparison()
                .ignoringFields("serialVersionUID")
                .isEqualTo(yhteystieto);
    }

    @Test
    public void henkiloDtoNullFieldsAreNotMapped() {
        HenkiloDto henkiloDtosour = createHenkiloDto(null, "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        HenkiloDto henkiloDtodest = createHenkiloDto("arpa", null, "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        this.modelmapper.map(henkiloDtosour, henkiloDtodest);
        assertThat(henkiloDtodest.getEtunimet()).isNotNull();
        assertThat(henkiloDtodest.getKutsumanimi()).isNotNull();
    }

    @Test
    public void henkiloPerustietoDtoExternalIdShouldMapToEntity() {
        HenkiloPerustietoDto dto = HenkiloPerustietoDto.builder()
                .externalIds(asList("eka", "toka"))
                .build();

        Henkilo entity = this.modelmapper.map(dto, Henkilo.class);
        dto = this.modelmapper.map(entity, HenkiloPerustietoDto.class);

        assertThat(dto.getExternalIds()).containsExactlyInAnyOrder("eka", "toka");
    }

    @Test
    public void henkiloPerustietoDtoIdentificationIdShouldMapToEntity() {
        HenkiloPerustietoDto dto = HenkiloPerustietoDto.builder()
                .identifications(asList(
                        IdentificationDto.of(IdpEntityId.email, "value1"),
                        IdentificationDto.of(IdpEntityId.google, "value2")))
                .build();

        Henkilo entity = this.modelmapper.map(dto, Henkilo.class);
        dto = this.modelmapper.map(entity, HenkiloPerustietoDto.class);

        assertThat(dto.getIdentifications())
                .extracting("idpEntityId", "identifier")
                .containsExactlyInAnyOrder(tuple(IdpEntityId.email, "value1"), tuple(IdpEntityId.google, "value2"));
    }

    @Test
    public void henkiloReadDto() {
        assertThat(modelmapper.map(Henkilo.builder().build(), HenkiloReadDto.class).getYksiloityVTJ()).isFalse();
        assertThat(modelmapper.map(Henkilo.builder().yksiloityVTJ(true).build(), HenkiloReadDto.class).getYksiloityVTJ()).isTrue();
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
