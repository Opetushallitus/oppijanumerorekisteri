package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointitieto;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface YksilointitietoRepository extends JpaRepository<Yksilointitieto, Long>, YksilointitietoRepositoryCustom {

    Optional<Yksilointitieto> findByHenkilo(Henkilo henkilo);

}
