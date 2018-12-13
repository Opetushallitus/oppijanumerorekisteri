package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface PermissionChecker {
    List<HenkiloDto> getPermissionCheckedHenkilos(List<HenkiloDto> persons, Map<String, List<String>> allowedRoles,
                                                  ExternalPermissionService permissionCheckService) throws IOException;

    Map<String, HenkiloDto> getPermissionCheckedHenkilos(Map<String, HenkiloDto> persons, Map<String, List<String>> allowedRoles,
                                                         ExternalPermissionService permissionCheckService) throws IOException;

    boolean isAllowedToAccessPerson(String userOid, Map<String, List<String>> allowedPalveluRooli, ExternalPermissionService externalPermissionService) throws IOException;

    /**
     * Palauttaa käyttäjän voimassaolevat organisaatiot
     * @return organisaatiot
     */
    Set<String> getOrganisaatioOids();

    /**
     * Palauttaa käyttäjän voimassaolevat organisaatiot annettuun käyttöoikeuteen.
     * @param palvelu palvelu
     * @param kayttooikeus käyttöoikeus
     * @return organisaatiot
     */
    Set<String> getOrganisaatioOids(String palvelu, String kayttooikeus);

    boolean isSuperUser();
}
