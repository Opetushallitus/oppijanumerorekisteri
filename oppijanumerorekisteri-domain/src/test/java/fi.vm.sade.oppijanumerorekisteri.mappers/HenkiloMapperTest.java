package fi.vm.sade.oppijanumerorekisteri.mappers;


import DTOs.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = OrikaSpringMapper.class)
public class HenkiloMapperTest {
    @Autowired
    private OrikaSpringMapper modelmapper;

    @Test
    public void HenkiloToHenkiloPerustietoDto() {
        Henkilo henkilo = EntityUtils.createPerustietoHenkilo("arpa", "kuutio", "123456-9999", "1.2.3.4.5", "fi", "suomi", "246");
        HenkiloPerustietoDto henkiloPerustietoDto = modelmapper.map(henkilo, HenkiloPerustietoDto.class);

        assertThat(henkiloPerustietoDto.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkiloPerustietoDto.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkiloPerustietoDto.getHetu()).isEqualTo("123456-9999");
        assertThat(henkiloPerustietoDto.getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKielikoodi()).isEqualTo("fi");
        assertThat(henkiloPerustietoDto.getAidinkieli().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkiloPerustietoDto.getKansalaisuus().iterator().next().getKansalaisuuskoodi()).isEqualTo("246");
    }

    @Test
    public void HenkiloPerustietoDtoToHenkilo() {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246");
        Henkilo henkilo = modelmapper.map(henkiloPerustietoDto, Henkilo.class);
        assertThat(henkilo.getKutsumanimi()).isEqualTo("arpa");
        assertThat(henkilo.getSukunimi()).isEqualTo("kuutio");
        assertThat(henkilo.getHetu()).isEqualTo("123456-9999");
        assertThat(henkilo.getOidhenkilo()).isEqualTo("1.2.3.4.5");
        assertThat(henkilo.getAidinkieli().getKielikoodi()).isEqualTo("fi");
        assertThat(henkilo.getAidinkieli().getKielityyppi()).isEqualTo("suomi");
        assertThat(henkilo.getKansalaisuus().iterator().next().getKansalaisuuskoodi()).isEqualTo("246");
    }
}
