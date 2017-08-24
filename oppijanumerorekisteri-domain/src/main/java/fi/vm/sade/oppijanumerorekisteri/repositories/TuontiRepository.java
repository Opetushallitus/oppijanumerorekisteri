package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

public interface TuontiRepository extends CrudRepository<Tuonti, Long> {

    Optional<Tuonti> findById(Long id);

}
