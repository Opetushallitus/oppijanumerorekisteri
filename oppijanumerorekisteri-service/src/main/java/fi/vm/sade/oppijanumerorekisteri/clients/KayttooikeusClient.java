package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;

import java.util.List;
import java.util.Set;

public interface KayttooikeusClient {
    boolean checkUserPermissionToUser(String callingUserOid, String userOid, List<String> allowedRoles,
                                      ExternalPermissionService externalPermissionService, Set<String> callingUserRoles);
}
