package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;

import java.io.IOException;
import java.util.List;

public interface PermissionChecker {
    List<HenkiloDto> getPermissionCheckedHenkilos(List<HenkiloDto> persons, List<String> allowedRoles,
                                                  ExternalPermissionService permissionCheckService) throws IOException;
    boolean isAllowedToAccessPerson(String userOid, List<String> allowedRoles,
                                           ExternalPermissionService externalPermissionService) throws IOException;
    boolean isSuperUser();
}
