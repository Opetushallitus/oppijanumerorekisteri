package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointitieto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface YksilointitietoRepository extends JpaRepository<Yksilointitieto, Long>, YksilointitietoRepositoryCustom {

    Optional<Yksilointitieto> findByHenkilo(Henkilo henkilo);

}
