package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.AsiayhteysCriteria;
import java.util.List;

public interface AsiayhteysRepository {

    /**
     * Palauttaa kaikki sellaiset henkilöt, jotka pitäisi lisätä
     * muutostietopalveluun.
     *
     * @param criteria hakukriteerit
     * @param limit rivien maksimimäärä
     * @return lisättävät henkilöt
     */
    List<Henkilo> findLisattavat(AsiayhteysCriteria criteria, long limit);

    /**
     * Palauttaa kaikki sellaiset henkilöt, jotka pitäisi poistaa
     * muutostietopalvelusta.
     *
     * @param criteria hakukriteerit
     * @param limit rivien maksimimäärä
     * @return poistettavat henkilöt
     */
    List<Henkilo> findPoistettavat(AsiayhteysCriteria criteria, long limit);

}
