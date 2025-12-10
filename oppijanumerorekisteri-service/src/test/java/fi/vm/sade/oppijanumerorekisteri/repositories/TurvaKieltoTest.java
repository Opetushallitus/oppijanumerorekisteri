package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriApiTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.function.Consumer;
import java.util.stream.Collectors;

import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
class TurvaKieltoTest {
    @Autowired
    private HenkiloRepository henkiloRepository;
    @Autowired
    private HenkiloService henkiloService;
    @Autowired
    private OppijaService oppijaService;
    @MockBean
    private KoodistoService koodistoService;


    /**
     * Relates to <a href="https://jira.eduuni.fi/browse/KJHH-2231">...</a>
     */
    @Test
    @Sql("/turvakielto/truncate_data.sql")
    @Sql("/turvakielto/test_data_turvakielto.sql")
    @Transactional
    @OppijanumerorekisteriApiTest.UserRekisterinpitaja
    void testSetTurvakielto() {
        when(koodistoService.list(Koodisto.SUKUPUOLI))
                .thenReturn(new KoodiTypeListBuilder(Koodisto.SUKUPUOLI).koodi("1").koodi("2").build());
        var petteri = getHenkiloDto();
        Assertions.assertEquals(1, getYtjYhteystietoCount(petteri));
        Assertions.assertEquals("493", petteri.getKotikunta());

        var petteriAfter = modify(h -> h.setTurvakielto(true));
        Assertions.assertEquals("493", petteriAfter.getKotikunta());
        Assertions.assertEquals(0, getYtjYhteystietoCount(getHenkiloDto()));
        // API response DTOs
        Assertions.assertEquals(null, getHenkiloDto().getKotikunta());
        Assertions.assertEquals(null, getOppijaReadDto().getKotikunta());
    }

    @Test
    @Sql("/turvakielto/truncate_data.sql")
    @Sql("/turvakielto/test_data_turvakielto.sql")
    @Transactional
    void testSetTurvakieltoFalse() {
        var petteri = getHenkiloDto();
        Assertions.assertEquals(1, getYtjYhteystietoCount(petteri));

        var petteriAfter = modify(h -> h.setEtunimet("Niko-Petteri Testi2"));
        Assertions.assertEquals(1, getYtjYhteystietoCount(getHenkiloDto()));
        Assertions.assertEquals("Niko-Petteri Testi2", petteriAfter.getEtunimet());
    }

    private Henkilo modify(Consumer<Henkilo> consumer) {
        return modifyByHetu("260626-9554", consumer);
    }

    private HenkiloDto getHenkiloDto() {
        return henkiloService.getByHetu("260626-9554");
    }

    private OppijaReadDto getOppijaReadDto() {
        var result = oppijaService.listMastersBy(OppijaTuontiCriteria.builder().build(), 1, 10);
        return result.getResults().get(0).getMaster();
    }

    private Henkilo modifyByHetu(String hetu, Consumer<Henkilo> consumer) {
        var henkilo = henkiloRepository.findByHetu(hetu).orElseThrow();
        consumer.accept(henkilo);
        henkiloRepository.save(henkilo);
        return henkilo;
    }

    private static int getYtjYhteystietoCount(HenkiloDto petteriAfter) {
        return petteriAfter.getYhteystiedotRyhma().stream()
                .filter(a -> a.getRyhmaAlkuperaTieto().equals("alkupera1")).collect(Collectors.toSet()).size();
    }
}
