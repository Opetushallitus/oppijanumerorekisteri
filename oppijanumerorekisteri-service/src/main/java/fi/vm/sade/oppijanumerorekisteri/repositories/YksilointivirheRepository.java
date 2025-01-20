package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointivirhe;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface YksilointivirheRepository extends CrudRepository<Yksilointivirhe, Long> {

    Optional<Yksilointivirhe> findByHenkilo(Henkilo henkilo);

}
