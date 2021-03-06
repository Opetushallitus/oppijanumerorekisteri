package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.KoodistoServiceMock;
import fi.vm.sade.oppijanumerorekisteri.dto.KoodiUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = {OrikaConfiguration.class, KoodistoServiceMock.class})
public class OppijaMappersTest {

    @Autowired
    private OrikaConfiguration mapper;

    @MockBean
    private KansalaisuusRepository kansalaisuusRepository;

    @Test
    public void mapperShouldMapOid() {
        TuontiRivi entity = TuontiRivi.builder()
                .henkilo(Henkilo.builder().oidHenkilo("oid123").build())
                .build();

        OppijaTuontiRiviReadDto dto = mapper.map(entity, OppijaTuontiRiviReadDto.class);

        assertThat(dto.getHenkilo().getOid()).isEqualTo("oid123");
    }

    @Test
    public void mapperShouldMapAidinkieliUppercaseToDto() {
        TuontiRivi entity = TuontiRivi.builder()
                .henkilo(Henkilo.builder().aidinkieli(new Kielisyys("fi")).build())
                .build();

        OppijaTuontiRiviReadDto dto = mapper.map(entity, OppijaTuontiRiviReadDto.class);

        assertThat(dto.getHenkilo().getAidinkieli().getKoodi()).isEqualTo("FI");
    }

    @Test
    public void mapperShouldMapAidinkieliLowercaseToEntity() {
        OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto dto = new OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto();
        dto.setAidinkieli(new KoodiUpdateDto("FI"));

        Henkilo entity = mapper.map(dto, Henkilo.class);

        assertThat(entity.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
    }

}
