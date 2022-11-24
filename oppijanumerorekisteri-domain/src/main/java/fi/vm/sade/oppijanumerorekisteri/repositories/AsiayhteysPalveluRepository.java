package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysPalvelu;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface AsiayhteysPalveluRepository extends CrudRepository<AsiayhteysPalvelu, Long> {

    List<AsiayhteysPalvelu> findByHenkilo(Henkilo henkilo);

    Optional<AsiayhteysPalvelu> findByHenkiloAndPalvelutunniste(Henkilo henkilo, String palvelutunniste);

}
