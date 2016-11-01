package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserDetailsHelperImpl implements UserDetailsHelper {
    @Override
    public Optional<String> getCurrentUserOid() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication().getName());
    }

}
