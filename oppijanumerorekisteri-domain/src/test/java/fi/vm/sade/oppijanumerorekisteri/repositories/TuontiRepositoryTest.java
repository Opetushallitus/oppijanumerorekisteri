package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional
class TuontiRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private TuontiRepository repository;

    @Autowired
    private EntityManager em;

    @Test
    void timestampIsPopulatedCorrectly() {
        Tuonti toDb = repository.save(new Tuonti());
        em.flush();
        em.clear();

        assertThat(toDb.getId()).isNotNull();
        Optional<Tuonti> fromDb = repository.findById(toDb.getId());

        assertThat(fromDb).isNotEmpty();
        assertThat(fromDb.get().getAikaleima()).isNotNull();
    }
}
