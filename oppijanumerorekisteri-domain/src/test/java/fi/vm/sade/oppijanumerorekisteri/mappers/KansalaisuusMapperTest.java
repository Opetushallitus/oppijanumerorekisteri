package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = OrikaSpringMapper.class)
public class KansalaisuusMapperTest {
    @Autowired
    private OrikaSpringMapper modelmapper;

    @Test
    public void KansalaisuusToKansalaisuusDto() {
        Kansalaisuus kansalaisuus = EntityUtils.createKansalaisuus("246");
        KansalaisuusDto kansalaisuusDto = modelmapper.map(kansalaisuus, KansalaisuusDto.class);
        assertThat(kansalaisuusDto.getKansalaisuuskoodi()).isEqualTo("246");
    }

    @Test
    public void KansalaisuusDtoToKansalaisuus() {
        KansalaisuusDto kansalaisuusDto = DtoUtils.createKansalaisuusDto("246");
        Kansalaisuus kansalaisuus = modelmapper.map(kansalaisuusDto, Kansalaisuus.class);
        assertThat(kansalaisuus.getKansalaisuuskoodi()).isEqualTo("246");
    }
}
