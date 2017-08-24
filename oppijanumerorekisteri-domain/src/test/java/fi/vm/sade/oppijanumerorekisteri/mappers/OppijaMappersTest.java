package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = {OrikaConfiguration.class})
public class OppijaMappersTest {

    @Autowired
    private OrikaConfiguration mapper;

    @Test
    public void mapperShouldMapOid() {
        TuontiRivi entity = TuontiRivi.builder()
                .henkilo(Henkilo.builder().oidHenkilo("oid123").build())
                .build();

        OppijaReadDto dto = mapper.map(entity, OppijaReadDto.class);

        assertThat(dto.getHenkilo().getOid()).isEqualTo("oid123");
    }

}
