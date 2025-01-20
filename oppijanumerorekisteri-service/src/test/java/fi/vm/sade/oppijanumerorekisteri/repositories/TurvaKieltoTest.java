package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@RunWith(SpringRunner.class)
@SpringBootTest
class TurvaKieltoTest {

    @Autowired
    private HenkiloRepository henkiloRepository;


    /**
     * Relates to <a href="https://jira.eduuni.fi/browse/KJHH-2231">...</a>
     */
    @Test
    @Sql("/turvakielto/truncate_data.sql")
    @Sql("/turvakielto/test_data_turvakielto.sql")
    @Transactional
    void testSetTurvakielto() {

        Henkilo petteri = henkiloRepository.findByHetu("260626-9554").orElseThrow();
        Assertions.assertEquals(1, getYtjYhteystietoCount(petteri));
        Assertions.assertEquals("493", petteri.getKotikunta());

        petteri.setTurvakielto(true);
        henkiloRepository.save(petteri);

        Henkilo petteriAfter = henkiloRepository.findByHetu("260626-9554").orElseThrow();
        Assertions.assertEquals(null, petteriAfter.getKotikunta());
        Assertions.assertEquals(0, getYtjYhteystietoCount(petteriAfter));
    }

    @Test
    @Sql("/turvakielto/truncate_data.sql")
    @Sql("/turvakielto/test_data_turvakielto.sql")
    @Transactional
    void testSetTurvakieltoFalse() {
        Henkilo petteri = henkiloRepository.findByHetu("260626-9554").orElseThrow();
        Assertions.assertEquals(1, getYtjYhteystietoCount(petteri));
        petteri.setEtunimet("Niko-Petteri Testi2");
        henkiloRepository.save(petteri);
        Henkilo petteriAfter = henkiloRepository.findByHetu("260626-9554").orElseThrow();
        Assertions.assertEquals(1, getYtjYhteystietoCount(petteriAfter));
        Assertions.assertEquals("Niko-Petteri Testi2", petteriAfter.getEtunimet());
    }

    private static int getYtjYhteystietoCount(Henkilo petteriAfter) {
        return petteriAfter.getYhteystiedotRyhma().stream()
                .filter(a -> a.getRyhmaAlkuperaTieto().equals("alkupera1")).collect(Collectors.toSet()).size();
    }
}
