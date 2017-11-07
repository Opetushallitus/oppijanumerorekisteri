package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import java.util.Optional;

public interface TuontiRepositoryCustom {

    /**
     * Hakee oppijoiden tuonnin päivitystä varten.
     *
     * @param id oppijoiden tuonnin id
     * @return oppijoiden tuonti
     */
    Optional<Tuonti> findForUpdateById(Long id);

}
