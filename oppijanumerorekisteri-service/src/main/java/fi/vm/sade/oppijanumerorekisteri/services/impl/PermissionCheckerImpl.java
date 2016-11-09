package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service("permissionChecker")
public class PermissionCheckerImpl {
    private static final String ROLE_HENKILONHALLINTA_PREFIX = "ROLE_APP_HENKILONHALLINTA_";

    public boolean isAllowedToAccessPerson(String personOid, List<String> allowedRoles,
                                           ExternalPermissionService permissionCheckService) {
        Set<String> casRoles = getCasRoles();
        if(isSuperUser(casRoles)) {
            return true;
        }
        else {
            return false;
        }
    }

    private static boolean isSuperUser(Set<String> roles) {
        return roles.contains(ROLE_HENKILONHALLINTA_PREFIX + "OPHREKISTERI");
    }

    private Set<String> getCasRoles() {
        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        return authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
    }

}
