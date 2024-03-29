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

    boolean isAllowedToModifyPerson(String userOid, Map<String, List<String>> allowedPalveluRooli, ExternalPermissionService externalPermissionService) throws IOException;

    boolean isAllowedToReadPerson(String userOid, Map<String, List<String>> allowedPalveluRooli,
                                  ExternalPermissionService externalPermissionService);

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

    /**
     * Palauttaa käyttäjän voimassaolevat organisaatiot annettuun käyttöoikeuteen.
     * @param palvelu palvelu
     * @param kayttooikeus käyttöoikeus
     * @return organisaatiot
     */
    Set<String> getOrganisaatioOidsByKayttaja(String palvelu, String... kayttooikeus);

    /**
     * Palauttaa rekursiivisesti kaikki käyttäjän voimassaolevat organisaatiot annettuun käyttöoikeuteen.
     * @param palvelu palvelu
     * @param oikeudet käyttöoikeus
     * @return organisaatiot
     */
    Set<String> getAllOrganisaatioOids(String palvelu, String... oikeudet);

    /**
     * Rekisterinpitäjä, joka pystyy tekemään mitä tahansa
     * @return Onko kirjautunut käyttäjä rekisterinpitäjä
     */
    boolean isSuperUser();

    /**
     * Rekisterinpitäjä, joka pystyy tekemään mitä tahansa, tai rekisterinpitäjä luku, joka näkee kaikki tiedot
     * @return Onko kirjautunut käyttäjä rekisterinpitäjä tai rekisterinpitäjä luku
     */
    boolean isSuperUserOrCanReadAll();
}
