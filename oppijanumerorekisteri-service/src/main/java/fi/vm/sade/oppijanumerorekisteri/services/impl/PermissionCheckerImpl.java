package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service("permissionChecker")
@RequiredArgsConstructor
public class PermissionCheckerImpl implements PermissionChecker {
    private static final String ROLE_HENKILONHALLINTA_PREFIX = "ROLE_APP_HENKILONHALLINTA_";
    private static final String ROLE_OPPIJOIDENTUONTI = "ROLE_APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI";
    private static final String ROLE_OPPIJOIDENTUONTI_TEMPLATE = "ROLE_APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_%s";

    private final static Logger logger = LoggerFactory.getLogger(PermissionChecker.class);

    private final KayttooikeusClient kayttooikeusClient;

    private final UserDetailsHelper userDetailsHelper;

    private final OrganisaatioRepository organisaatioRepository;

    public List<HenkiloDto> getPermissionCheckedHenkilos(List<HenkiloDto> persons, List<String> allowedRoles,
                                                         ExternalPermissionService permissionCheckService) throws IOException {
        List<HenkiloDto> permissionCheckedPersons = new ArrayList<>();

        if (persons == null || persons.isEmpty()) {
            return new ArrayList<>();
        }

        for (HenkiloDto person : persons) {
            if (person != null && this.isAllowedToAccessPerson(person.getOidHenkilo(), allowedRoles, permissionCheckService)) {
                permissionCheckedPersons.add(person);
            }
        }

        return permissionCheckedPersons;
    }


    @Override
    public boolean isAllowedToAccessPerson(String userOid, List<String> allowedRoles,
                                           ExternalPermissionService externalPermissionService) throws IOException {
        Set<String> callingUserRoles = this.getCasRoles();
        if (this.isSuperUser(callingUserRoles) || this.isOwnData(userOid)) {
            return true;
        }
        if (callingUserRoles.contains(ROLE_OPPIJOIDENTUONTI)) {
            // sallitaan tietojen käsittely jos virkailija ja oppija
            // ovat samassa organisaatiossa (ja virkailijalla on
            // oppijoiden tuonti -rooli kyseiseen organisaatioon)
            List<String> organisaatioOids = organisaatioRepository.findOidByHenkiloOid(userOid);
            if (organisaatioOids.stream()
                    .map(organisaatioOid -> String.format(ROLE_OPPIJOIDENTUONTI_TEMPLATE, organisaatioOid))
                    .anyMatch(rooli -> callingUserRoles.contains(rooli))) {
                return true;
            }
        }
        String callingUserOid = this.userDetailsHelper.getCurrentUserOid();
        return kayttooikeusClient.checkUserPermissionToUser(callingUserOid, userOid, allowedRoles,
                externalPermissionService, callingUserRoles);
    }

    @Override
    public boolean isSuperUser() {
        return this.isSuperUser(this.getCasRoles());
    }

    private boolean isSuperUser(Set<String> roles) {
        return roles.contains(ROLE_HENKILONHALLINTA_PREFIX + "OPHREKISTERI");
    }

    private boolean isOwnData(String dataHenkiloOid) {
        return this.userDetailsHelper.getCurrentUserOid().equals(dataHenkiloOid);
    }

    private Set<String> getCasRoles() {
        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        return authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
    }

}
