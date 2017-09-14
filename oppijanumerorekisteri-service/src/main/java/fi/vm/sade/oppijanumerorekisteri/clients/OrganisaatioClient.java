package fi.vm.sade.oppijanumerorekisteri.clients;

import java.util.Map;
import java.util.Optional;
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

    @Getter
    @Setter
    @ToString
    public static class OrganisaatioDto {

        private String oid;
        private Map<String, String> nimi;

    }

}
