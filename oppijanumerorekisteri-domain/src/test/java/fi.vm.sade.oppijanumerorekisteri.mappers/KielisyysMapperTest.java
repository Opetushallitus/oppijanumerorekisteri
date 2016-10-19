package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = OrikaSpringMapper.class)
public class KielisyysMapperTest {
    @Autowired
    private OrikaSpringMapper modelmapper;

    @Test
    public void KielisyysToKielisyysDto() {
        Kielisyys kielisyys = EntityUtils.createKielisyys("fi", "suomi");
        KielisyysDto kielisyysDto = modelmapper.map(kielisyys, KielisyysDto.class);
        assertThat(kielisyysDto.getKielikoodi()).isEqualTo("fi");
        assertThat(kielisyysDto.getKielityyppi()).isEqualTo("suomi");
    }

    @Test
    public void KielisyysDtoToKielisyys() {
        KielisyysDto kielisyysDto = DtoUtils.createKielisyysDto("fi", "suomi");
        Kielisyys kielisyys = modelmapper.map(kielisyysDto, Kielisyys.class);
        assertThat(kielisyys.getKielikoodi()).isEqualTo("fi");
        assertThat(kielisyys.getKielityyppi()).isEqualTo("suomi");
    }
}
