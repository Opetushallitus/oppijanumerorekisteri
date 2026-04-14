package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.repositories.AbstractRepositoryTest;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
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
