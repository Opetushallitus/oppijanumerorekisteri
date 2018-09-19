package fi.vm.sade.oppijanumerorekisteri.clients;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Rajapinta organisaatiopalvelun käyttöön.
 */
public interface OrganisaatioClient {

    /**
     * Palauttaa tiedon löytyykö organisaatio annetulla OID:lla
     * organisaatiopalvelusta.
     *
     * @param oid organisaatio oid
     * @return true jos organisaatio löytyy, muuten false
     */
    boolean exists(String oid);

    /**
     * Palauttaa organisaation annetulla OID:lla.
     *
     * @param oid organisaatio oid
     * @return organisaatio
     */
    Optional<OrganisaatioDto> getByOid(String oid);

    /**
     * Palauttaa organisaation aliorganisaatiot.
     * @param oid organisaatio
     * @param rekursiivisesti haetaanko aliorganisaatiot rekursiivisesti
     * @param tilat organisaatioiden tilat
     * @return aliorganisaatiot
     */
    Set<String> getChildOids(String oid, boolean rekursiivisesti, OrganisaatioTilat tilat);

    @Getter
    @Setter
    @ToString
    public static class OrganisaatioDto {

        private String oid;
        private Map<String, String> nimi;

    }

}
