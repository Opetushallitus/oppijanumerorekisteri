package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;

import java.util.List;
import java.util.Optional;

public interface TuontiRepositoryCustom {

    /**
     * Hakee oppijoiden tuonnin päivitystä varten.
     *
     * @param id oppijoiden tuonnin id
     * @return oppijoiden tuonti
     */
    Optional<Tuonti> findForUpdateById(Long id);

    /**
     * Palauttaa oppijoiden tuonnin rivit ja niihin liittyvät henkilöt
     * hakukriteerien perusteella. Hakee henkilöiden perustiedot,
     * yhteystiedotryhmät ja yhteystiedot muistiin.
     *
     * @param criteria hakukriteerit
     * @return tuonnin rivit
     */
    List<TuontiRivi> findRiviBy(OppijaTuontiCriteria criteria, boolean isSuperUser);

    /**
     * Palauttaa ne Oppijoiden tuonnit, joissa on tarve lähettää sähköposti-ilmoitus
     *
     * @return oppijoiden tuonnit
     */
    List<Tuonti> findTuontiWithIlmoitustarve();

    /**
     * Palauttaa ne oppijoiden tuonnit, joissa ilmoitusta ei lähetetä ja joita ei ole merkattu käsitellyiksi
     *
     * @return oppijoiden tuonnit
     */
    List<Tuonti> findNotKasiteltyTuontiWithoutIlmoitustarve();

}
