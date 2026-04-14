package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import ma.glasnost.orika.MapperFacade;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class KielisyysMapperTest {
    @Autowired
    private MapperFacade modelmapper;

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
