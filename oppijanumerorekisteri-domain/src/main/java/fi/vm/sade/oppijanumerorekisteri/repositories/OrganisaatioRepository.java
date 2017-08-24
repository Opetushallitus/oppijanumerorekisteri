package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

public interface OrganisaatioRepository extends CrudRepository<Organisaatio, Long> {

    Optional<Organisaatio> findByOid(String oid);

}
