package fi.vm.sade.oppijanumerorekisteri.DAOs;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

@Repository
public interface TestDao extends CrudRepository<Henkilo, String> {

}
