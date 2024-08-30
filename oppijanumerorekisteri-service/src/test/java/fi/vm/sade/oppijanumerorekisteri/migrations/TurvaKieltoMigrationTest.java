package fi.vm.sade.oppijanumerorekisteri.migrations;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

import java.util.stream.Collectors;

@DataJpaTest
class TurvaKieltoMigrationTest {
    @Autowired
    private HenkiloRepository henkiloRepository;

    @Test
    @Sql("/migration/test_data_turvakielto_migration.sql")
    @Sql("/db/migration/V20221129000000000__turvakielto_siivous.sql")
    void testTurvaKieltoMigration() {
        Henkilo petteri = henkiloRepository.findByHetu("260626-9554").orElseThrow();
        Assertions.assertEquals(null, petteri.getKotikunta());
        Assertions.assertEquals(0, getYtjYhteystietoCount(petteri));

        Henkilo eric = henkiloRepository.findByHetu("150380-919C").orElseThrow();
        Assertions.assertEquals("999", eric.getKotikunta());
        Assertions.assertEquals(1, getYtjYhteystietoCount(eric));
    }

    private static int getYtjYhteystietoCount(Henkilo petteriAfter) {
        return petteriAfter.getYhteystiedotRyhma().stream()
                .filter(a -> a.getRyhmaAlkuperaTieto().equals("alkupera1")).collect(Collectors.toSet()).size();
    }
}
