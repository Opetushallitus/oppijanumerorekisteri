package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface PermissionChecker {
    List<HenkiloDto> filterUnpermittedHenkilo(Collection<HenkiloDto> persons, Map<String, List<String>> allowedRoles,
                                              ExternalPermissionService permissionCheckService);

    List<HenkiloPerustietoDto> filterUnpermittedHenkiloPerustieto(Collection<HenkiloPerustietoDto> persons, Map<String, List<String>> allowedRoles,
                                                                  ExternalPermissionService permissionCheckService);

    Map<String, HenkiloDto> filterUnpermittedHenkilo(Map<String, HenkiloDto> persons, Map<String, List<String>> allowedRoles,
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
