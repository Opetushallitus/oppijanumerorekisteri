package fi.vm.sade.oppijanumerorekisteri.services;

import java.util.Optional;

public interface UserDetailsHelper {

    /**
     * Palauttaa kirjautuneen käyttäjän OID:n, muuten {@link Optional#empty()}.
     *
     * @return käyttäjän oid
     */
    Optional<String> findCurrentUserOid();

    /**
     * Palauttaa kirjautuneen käyttäjän OID:n.
     *
     * @return käyttäjän oid
     * @throws fi.vm.sade.oppijanumerorekisteri.exceptions.UnauthorizedException
     * jos käyttäjä ei ole kirjautunut
     */
    String getCurrentUserOid();

}
