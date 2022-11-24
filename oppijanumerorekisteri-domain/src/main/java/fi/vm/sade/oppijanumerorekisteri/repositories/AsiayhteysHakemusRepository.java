package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysHakemus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface AsiayhteysHakemusRepository extends CrudRepository<AsiayhteysHakemus, Long>, AsiayhteysHakemusRepositoryCustom {

    List<AsiayhteysHakemus> findByHenkilo(Henkilo henkilo);

    Optional<AsiayhteysHakemus> findByHenkiloAndHakemusOid(Henkilo henkilo, String hakemusOid);

}
