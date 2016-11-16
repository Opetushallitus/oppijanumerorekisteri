package fi.vm.sade.oppijanumerorekisteri.mappers;


import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import fi.vm.sade.oppijanumerorekisteri.configurations.OrikaConfiguration;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = OrikaConfiguration.class)
public class HenkiloMapperTest {
    @Autowired
    private OrikaConfiguration modelmapper;

    @Test
    public void henkiloToHenkiloPerustietoDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1");
        HenkiloPerustietoDto henkiloPerustietoDto = modelmapper.map(henkilo, HenkiloPerustietoDto.class);

        assertThat(henkiloPerustietoDto.getEtunimet()).isEqualTo("arpa");
        assertThat(henkiloPerustietoDto.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkiloPerustietoDto.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkiloPerustietoDto.getHetu()).isEqualTo("123456-9999");
        assertThat(henkiloPerustietoDto.getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKielikoodi()).isEqualTo("fi");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkiloPerustietoDto.getKasittelijaOid()).isEqualTo("1.2.3.4.1");
    }

    @Test
    public void henkiloPerustietoDtoToHenkilo() {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1");
        Henkilo henkilo = modelmapper.map(henkiloPerustietoDto, Henkilo.class);
        assertThat(henkilo.getEtunimet()).isEqualTo("arpa");
        assertThat(henkilo.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkilo.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkilo.getHetu()).isEqualTo("123456-9999");
        assertThat(henkilo.getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkilo.getAidinkieli().getKielikoodi()).isEqualTo("fi");
        assertThat(henkilo.getAidinkieli().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkilo.getKasittelijaOid()).isEqualTo("1.2.3.4.1");
    }

    @Test
    public void henkiloToHenkiloOidHetuNimiDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1");
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = modelmapper.map(henkilo, HenkiloOidHetuNimiDto.class);
        assertThat(henkiloOidHetuNimiDto.getEtunimet()).isEqualTo("arpa");
        assertThat(henkiloOidHetuNimiDto.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkiloOidHetuNimiDto.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkiloOidHetuNimiDto.getHetu()).isEqualTo("123456-9999");
        assertThat(henkiloOidHetuNimiDto.getOidhenkilo()).isEqualTo("1.2.3.4.5");
    }

    @Test
    public void henkiloOidHetuNimiDtoToHenkilo() {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5");
        Henkilo henkilo = modelmapper.map(henkiloOidHetuNimiDto, Henkilo.class);
        assertThat(henkilo.getEtunimet()).isEqualTo("arpa");
        assertThat(henkilo.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkilo.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkilo.getHetu()).isEqualTo("123456-9999");
        assertThat(henkilo.getOidhenkilo()).isEqualTo("1.2.3.4.5");
    }

    @Test
    public void henkiloToHenkiloDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1");
        HenkiloDto henkiloDto = modelmapper.map(henkilo, HenkiloDto.class);
        assertThat(henkiloDto.getEtunimet()).isEqualTo("arpa");
        assertThat(henkiloDto.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkiloDto.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkiloDto.getHetu()).isEqualTo("123456-9999");
        assertThat(henkiloDto.getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkiloDto.isPassivoitu()).isFalse();
        assertThat(henkiloDto.getHenkilotyyppi()).isEqualTo(HenkiloTyyppi.OPPIJA);
        assertThat(henkiloDto.getAidinkieli().getKielikoodi()).isEqualTo("fi");
        assertThat(henkiloDto.getAidinkieli().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkiloDto.getKielisyys().iterator().next().getKielikoodi()).isEqualTo("fi");
        assertThat(henkiloDto.getKielisyys().iterator().next().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkiloDto.getKansalaisuus().iterator().next().getKansalaisuuskoodi()).isEqualTo("246");
        assertThat(henkiloDto.getKasittelijaOid()).isEqualTo("1.2.3.4.1");
    }

    @Test
    public void henkiloDtoToHenkilo() {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1");
        Henkilo henkilo = modelmapper.map(henkiloDto, Henkilo.class);
        assertThat(henkilo.getEtunimet()).isEqualTo("arpa");
        assertThat(henkilo.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkilo.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkilo.getHetu()).isEqualTo("123456-9999");
        assertThat(henkilo.getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkilo.isPassivoitu()).isFalse();
        assertThat(henkilo.getAidinkieli().getKielikoodi()).isEqualTo("fi");
        assertThat(henkilo.getAidinkieli().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkilo.getKielisyys().iterator().next().getKielikoodi()).isEqualTo("fi");
        assertThat(henkilo.getKielisyys().iterator().next().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkilo.getKansalaisuus().iterator().next().getKansalaisuuskoodi()).isEqualTo("246");
        assertThat(henkilo.getKasittelijaOid()).isEqualTo("1.2.3.4.1");
    }

    @Test
    public void henkiloDtoNullFieldsAreNotMapped() {
        HenkiloDto henkiloDtosour = DtoUtils.createHenkiloDto(null, "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1");
        HenkiloDto henkiloDtodest = DtoUtils.createHenkiloDto("arpa", null, "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", "1.2.3.4.1");
        this.modelmapper.map(henkiloDtosour, henkiloDtodest);
        assertThat(henkiloDtodest.getEtunimet()).isNotNull();
        assertThat(henkiloDtodest.getKutsumanimi()).isNotNull();
    }
}
