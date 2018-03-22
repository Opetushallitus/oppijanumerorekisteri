package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysPalvelu;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

public interface AsiayhteysPalveluRepository extends CrudRepository<AsiayhteysPalvelu, Long> {

    List<AsiayhteysPalvelu> findByHenkilo(Henkilo henkilo);

    Optional<AsiayhteysPalvelu> findByHenkiloAndPalvelutunniste(Henkilo henkilo, String palvelutunniste);

}
