package fi.vm.sade.oppijanumerorekisteri.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

@Repository
public interface TestDao extends CrudRepository<Henkilo, String> {

}
