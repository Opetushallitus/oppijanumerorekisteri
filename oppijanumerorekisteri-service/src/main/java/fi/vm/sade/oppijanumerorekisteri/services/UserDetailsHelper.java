package fi.vm.sade.oppijanumerorekisteri.services;

import java.util.Optional;

public interface UserDetailsHelper {

    Optional<String> findCurrentUserOid();

    String getCurrentUserOid();

}
