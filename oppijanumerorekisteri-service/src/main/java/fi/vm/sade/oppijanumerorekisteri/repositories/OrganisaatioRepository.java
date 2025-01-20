package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface OrganisaatioRepository extends CrudRepository<Organisaatio, Long>, OrganisaatioRepositoryCustom {

    Optional<Organisaatio> findByOid(String oid);

}
