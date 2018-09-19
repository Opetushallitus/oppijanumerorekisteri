package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.kayttooikeus.dto.OrganisaatioHenkiloDto;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioCriteria;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public interface KayttooikeusClient {

    Optional<KayttajaReadDto> getKayttajaByOid(String oid);

    @Deprecated
    boolean checkUserPermissionToUser(String callingUserOid, String userOid, List<String> allowedRoles,
                                      ExternalPermissionService externalPermissionService, Set<String> callingUserRoles);

    boolean checkUserPermissionToUserByPalveluRooli(String callingUserOid, String userOid, Map<String, List<String>> allowedPalveluRooli,
                                      ExternalPermissionService externalPermissionService, Set<String> callingUserRoles);

    void passivoiHenkilo(String oidHenkilo, String kasittelijaOid);

    KayttooikeudetDto getHenkiloKayttooikeudet(String henkiloOid, OrganisaatioCriteria criteria);

    void ldapSynkroniseHenkilo(String henkiloOid);
}
