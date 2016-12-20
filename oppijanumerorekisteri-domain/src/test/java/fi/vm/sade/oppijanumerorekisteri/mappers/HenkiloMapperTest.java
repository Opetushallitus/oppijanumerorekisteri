package fi.vm.sade.oppijanumerorekisteri.mappers;


import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = {OrikaConfiguration.class})
public class HenkiloMapperTest {
    @Autowired
    private OrikaConfiguration modelmapper;

    @Test
    public void henkiloToHenkiloPerustietoDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        HenkiloPerustietoDto henkiloPerustietoDto = modelmapper.map(henkilo, HenkiloPerustietoDto.class);

        assertThat(henkiloPerustietoDto.getEtunimet()).isEqualTo("arpa");
        assertThat(henkiloPerustietoDto.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkiloPerustietoDto.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkiloPerustietoDto.getHetu()).isEqualTo("123456-9999");
        assertThat(henkiloPerustietoDto.getOidHenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKieliTyyppi()).isEqualTo("suomi");
    }

    @Test
    public void henkiloPerustietoDtoToHenkilo() {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246", "externalid1");
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
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA,
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
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5");
        Henkilo henkilo = modelmapper.map(henkiloOidHetuNimiDto, Henkilo.class);
        assertThat(henkilo.getEtunimet()).isEqualTo("arpa");
        assertThat(henkilo.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkilo.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkilo.getHetu()).isEqualTo("123456-9999");
        assertThat(henkilo.getOidHenkilo()).isEqualTo("1.2.3.4.5");
    }

    @Test
    public void henkiloToHenkiloDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        HenkiloDto henkiloDto = modelmapper.map(henkilo, HenkiloDto.class);
        assertThat(henkiloDto).isEqualToIgnoringGivenFields(henkilo,
                "serialVersionUID", "aidinkieli", "asiointiKieli", "kielisyys", "kansalaisuus", "yhteystiedotRyhma");
        assertThat(henkiloDto.getAidinkieli()).isEqualToIgnoringGivenFields(henkilo.getAidinkieli(), "serialVersionUID");
        assertThat(henkiloDto.getAsiointiKieli()).isEqualToIgnoringGivenFields(henkilo.getAsiointiKieli(), "serialVersionUID");
        assertThat(henkiloDto.getKansalaisuus()).usingElementComparatorIgnoringFields("serialVersionUID")
                .isEqualTo(henkilo.getKansalaisuus());
        assertThat(henkiloDto.getKielisyys()).usingElementComparatorIgnoringFields("serialVersionUID")
                .isEqualTo(henkilo.getKielisyys());

        assertThat(henkiloDto.getYhteystiedotRyhma().size()).isEqualTo(henkilo.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto().getAlkuperatieto())
                .isEqualTo(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto());
        assertThat(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus().getRyhmanKuvaus())
                .isEqualTo(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus());
        assertThat(henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().size())
                .isEqualTo(henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().size()).isEqualTo(1);
        YhteystietoDto yhteystietoDto = henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        Yhteystieto yhteystieto = henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        assertThat(yhteystietoDto).isEqualToIgnoringGivenFields(yhteystieto, "serialVersionUID");
    }

    @Test
    public void henkiloDtoToHenkilo() {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        Henkilo henkilo = modelmapper.map(henkiloDto, Henkilo.class);
        assertThat(henkilo).isEqualToIgnoringGivenFields(henkilo,
                "serialVersionUID", "aidinkieli", "asiointiKieli", "kielisyys", "kansalaisuus", "yhteystiedotRyhma", "id", "version");
        assertThat(henkilo.getAidinkieli()).isEqualToIgnoringGivenFields(henkiloDto.getAidinkieli(), "serialVersionUID", "henkilos", "id", "version");
        assertThat(henkilo.getKansalaisuus()).usingElementComparatorIgnoringFields("serialVersionUID", "henkilos", "id", "version")
                .isEqualTo(henkiloDto.getKansalaisuus());
        assertThat(henkilo.getKielisyys()).usingElementComparatorIgnoringFields("serialVersionUID", "henkilos", "id", "version")
                .isEqualTo(henkiloDto.getKielisyys());

        assertThat(henkilo.getYhteystiedotRyhma().size()).isEqualTo(henkiloDto.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto())
                .isEqualTo(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaAlkuperaTieto().getAlkuperatieto());
        assertThat(henkilo.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus())
                .isEqualTo(henkiloDto.getYhteystiedotRyhma().iterator().next().getRyhmaKuvaus().getRyhmanKuvaus());
        assertThat(henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().size())
                .isEqualTo(henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().size()).isEqualTo(1);
        Yhteystieto yhteystieto = henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        YhteystietoDto yhteystietoDto = henkiloDto.getYhteystiedotRyhma().iterator().next().getYhteystieto().iterator().next();
        assertThat(yhteystietoDto).isEqualToIgnoringGivenFields(yhteystieto, "serialVersionUID");
    }

    @Test
    public void henkiloDtoNullFieldsAreNotMapped() {
        HenkiloDto henkiloDtosour = DtoUtils.createHenkiloDto(null, "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        HenkiloDto henkiloDtodest = DtoUtils.createHenkiloDto("arpa", null, "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        this.modelmapper.map(henkiloDtosour, henkiloDtodest);
        assertThat(henkiloDtodest.getEtunimet()).isNotNull();
        assertThat(henkiloDtodest.getKutsumanimi()).isNotNull();
    }
}
