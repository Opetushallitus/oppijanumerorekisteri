package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@RunWith(SpringRunner.class)
@IntegrationTest
@Transactional
public class HenkiloRepositoryTest {

    private static final String TESTI_HETU = "111111-1119";
    private static final String TOINEN_HETU = "121212-1219";

    @Autowired
    private HenkiloRepository repository;

    @Before
    public void testiData() {
        Henkilo toinenHenkilo = createTestHenkilo(TOINEN_HETU);
        repository.saveAndFlush(toinenHenkilo);
    }

    @Test
    public void findByKaikkiHetutReturnsEmpty() {
        String hetu = "111111-1239";
        Henkilo testiHenkilo = createTestHenkilo(hetu);
        repository.saveAndFlush(testiHenkilo);

        Optional<Henkilo> optHenkilo = repository.findByKaikkiHetut(TESTI_HETU);
        assertFalse(optHenkilo.isPresent());
    }

    @Test
    public void findByKaikkiHetutReturnsMatch() {

        String toinenHetu = "111111-1239";
        Henkilo testiHenkilo = createTestHenkilo(TESTI_HETU);
        testiHenkilo.addHetu(toinenHetu);
        repository.saveAndFlush(testiHenkilo);

        Optional<Henkilo> optHenkilo = repository.findByKaikkiHetut(toinenHetu);
        assertTrue(optHenkilo.isPresent());
    }

    private Henkilo createTestHenkilo(String hetu) {
        Date now = new Date();
        return Henkilo.builder()
                .oidHenkilo(UUID.randomUUID().toString())
                .etunimet("Testi Henkilö")
                .sukunimi("Testinovic")
                .hetu(hetu)
                .created(now)
                .modified(now)
                .build();
    }
}
