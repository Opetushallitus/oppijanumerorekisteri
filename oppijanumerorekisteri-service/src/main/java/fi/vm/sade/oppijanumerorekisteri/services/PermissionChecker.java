package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;

import java.io.IOException;
import java.util.List;

public interface PermissionChecker {
    boolean isAllowedToAccessPerson(String userOid, List<String> allowedRoles,
                                           ExternalPermissionService externalPermissionService) throws IOException;
}
