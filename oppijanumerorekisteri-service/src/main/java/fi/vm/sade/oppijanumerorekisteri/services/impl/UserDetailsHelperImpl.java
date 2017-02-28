package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.exceptions.UnauthorizedException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UserHasNoOidException;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import org.springframework.security.core.Authentication;

@Component
public class UserDetailsHelperImpl implements UserDetailsHelper {

    @Override
    public Optional<String> findCurrentUserOid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new UnauthorizedException("Käyttäjä ei ole kirjautunut");
        }
        return Optional.ofNullable(authentication.getName());
    }

    @Override
    public String getCurrentUserOid() {
        return findCurrentUserOid().orElseThrow(UserHasNoOidException::new);
    }

}
