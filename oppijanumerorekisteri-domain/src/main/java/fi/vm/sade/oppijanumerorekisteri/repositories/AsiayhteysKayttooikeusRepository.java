package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysKayttooikeus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

public interface AsiayhteysKayttooikeusRepository extends CrudRepository<AsiayhteysKayttooikeus, Long>, AsiayhteysKayttooikeusRepositoryCustom {

    Optional<AsiayhteysKayttooikeus> findByHenkilo(Henkilo henkilo);

}
