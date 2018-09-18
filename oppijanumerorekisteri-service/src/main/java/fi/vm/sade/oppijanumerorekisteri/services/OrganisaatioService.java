package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;

import java.util.Set;

/**
 * Rajapinta oppijan organisaatioiden käsittelyyn.
 *
 * @see OrganisaatioClient organisaatiopalvelun käyttö
 */
public interface OrganisaatioService {

    /**
     * Luo uuden organisaation.
     *
     * @param oid organisaatio oid
     * @return organisaatio
     * @throws ValidationException organisaatiota ei löydy
     * organisaatiopalvelusta
     */
    Organisaatio create(String oid);

    /**
     * Palauttaa organisaation aliorganisaatiot.
     * @param oid organisaatio
     * @param tilat organisaatioiden tilat
     * @return aliorganisaatiot
     */
    Set<String> getChildOids(String oid, OrganisaatioTilat tilat);

}
