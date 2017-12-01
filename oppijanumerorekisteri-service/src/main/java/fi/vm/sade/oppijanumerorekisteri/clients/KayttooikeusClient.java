package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.kayttooikeus.dto.OrganisaatioHenkiloDto;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioCriteria;

import java.util.List;
import java.util.Set;

public interface KayttooikeusClient {
    boolean checkUserPermissionToUser(String callingUserOid, String userOid, List<String> allowedRoles,
                                      ExternalPermissionService externalPermissionService, Set<String> callingUserRoles);

    void passivoiHenkilo(String oidHenkilo, String kasittelijaOid);

    KayttooikeudetDto getHenkiloKayttooikeudet(String henkiloOid, OrganisaatioCriteria criteria);

    List<OrganisaatioHenkiloDto> getOrganisaatioHenkilot(String henkiloOid);

    Set<String> getAktiivisetOrganisaatioHenkilot(String henkiloOid);

    void ldapSynkroniseHenkilo(String henkiloOid);
}
