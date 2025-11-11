package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
public class KielisyysMapperTest {
    @Autowired
    private OrikaConfiguration modelmapper;

    @Test
    public void KielisyysToKielisyysDto() {
        Kielisyys kielisyys = new Kielisyys("fi", "suomi");
        KielisyysDto kielisyysDto = modelmapper.map(kielisyys, KielisyysDto.class);
        assertThat(kielisyysDto.getKieliKoodi()).isEqualTo("fi");
        assertThat(kielisyysDto.getKieliTyyppi()).isEqualTo("suomi");
    }

    @Test
    public void KielisyysDtoToKielisyys() {
        KielisyysDto kielisyysDto = new KielisyysDto("fi", "suomi");
        Kielisyys kielisyys = modelmapper.map(kielisyysDto, Kielisyys.class);
        assertThat(kielisyys.getKieliKoodi()).isEqualTo("fi");
        assertThat(kielisyys.getKieliTyyppi()).isEqualTo("suomi");
    }
}
