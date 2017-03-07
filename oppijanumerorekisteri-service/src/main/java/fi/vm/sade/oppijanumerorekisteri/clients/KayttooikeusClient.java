package fi.vm.sade.oppijanumerorekisteri.clients;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;

import java.io.IOException;
import java.util.List;
import java.util.Set;

public interface KayttooikeusClient {
    boolean checkUserPermissionToUser(String callingUserOid, String userOid, List<String> allowedRoles,
                                      ExternalPermissionService externalPermissionService, Set<String> callingUserRoles)
            throws IOException;
    void passivoiHenkilo(String oidHenkilo, String kasittelijaOid) throws IOException;
}
