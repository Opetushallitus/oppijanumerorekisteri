package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface PermissionChecker {
    List<HenkiloDto> getPermissionCheckedHenkilos(List<HenkiloDto> persons, List<String> allowedRoles,
                                                  ExternalPermissionService permissionCheckService) throws IOException;

    Map<String, HenkiloDto> getPermissionCheckedHenkilos(Map<String, HenkiloDto> persons, List<String> allowedRoles,
                                                         ExternalPermissionService permissionCheckService) throws IOException;
    @Deprecated
    boolean isAllowedToAccessPerson(String userOid, List<String> allowedRoles,
                                           ExternalPermissionService externalPermissionService) throws IOException;

    boolean isAllowedToAccessPerson(String userOid, Map<String, List<String>> allowedPalveluRooli, ExternalPermissionService externalPermissionService) throws IOException;

    boolean isSuperUser();
}
