package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service("permissionChecker")
public class PermissionCheckerImpl implements PermissionChecker {
    private static final String ROLE_HENKILONHALLINTA_PREFIX = "ROLE_APP_HENKILONHALLINTA_";

    private final static Logger logger = LoggerFactory.getLogger(PermissionChecker.class);

    private KayttooikeusClient kayttooikeusClient;

    @Autowired
    public PermissionCheckerImpl(KayttooikeusClient kayttooikeusClient) {
        this.kayttooikeusClient = kayttooikeusClient;
    }

    @Override
    public boolean isAllowedToAccessPerson(String userOid, List<String> allowedRoles,
                                           ExternalPermissionService externalPermissionService) throws IOException {
        Set<String> callingUserRoles = getCasRoles();
        if(isSuperUser(callingUserRoles)) {
            return true;
        }
        else {
            String callingUserOid = SecurityContextHolder.getContext().getAuthentication().getName();
            return kayttooikeusClient.checkUserPermissionToUser(callingUserOid, userOid, allowedRoles,
                    externalPermissionService, callingUserRoles);
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
