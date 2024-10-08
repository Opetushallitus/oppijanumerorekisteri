package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toSet;

@Service("permissionChecker")
@RequiredArgsConstructor
public class PermissionCheckerImpl implements PermissionChecker {
    public static final String YLEISTUNNISTE_LUONTI_ACCESS_RIGHT_LITERAL = "YLEISTUNNISTE_LUONTI";
    private static final String YLEISTUNNISTE_LUONTI_ACCESS_RIGHT_SERVICE = "OPPIJANUMEROREKISTERI";
    public static final String YLEISTUNNISTE_LUONTI_ACCESS_RIGHT = "APP_" + YLEISTUNNISTE_LUONTI_ACCESS_RIGHT_SERVICE + "_" + YLEISTUNNISTE_LUONTI_ACCESS_RIGHT_LITERAL;
    public static final String ROLE_OPPIJANUMEROREKISTERI_PREFIX = "ROLE_APP_OPPIJANUMEROREKISTERI_";
    private static final String ROLE_OPPIJOIDENTUONTI = "ROLE_APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI";
    private static final String ORGANISAATIO_OID_PREFIX = "1.2.246.562.10";
    public static final String ROOT_ORGANISATION_SUFFIX = "_" + ORGANISAATIO_OID_PREFIX + ".00000000001";
    public static final String PALVELU_OPPIJANUMEROREKISTERI = "OPPIJANUMEROREKISTERI";
    public static final String KAYTTOOIKEUS_OPPIJOIDENTUONTI = "OPPIJOIDENTUONTI";
    public static final String KAYTTOOIKEUS_TUONTIDATA_READ = "TUONTIDATA_READ";
    public static final String KAYTTOOIKEUS_HENKILON_RU = "HENKILON_RU";
    public static final String KAYTTOOIKEUS_READ = "READ";

    private final KayttooikeusClient kayttooikeusClient;

    private final UserDetailsHelper userDetailsHelper;

    private final OrganisaatioRepository organisaatioRepository;

    private final OrganisaatioService organisaatioService;

    @Override
    public List<HenkiloDto> filterUnpermittedHenkilo(Collection<HenkiloDto> persons,
                                                     Map<String, List<String>> allowedRoles,
                                                     ExternalPermissionService permissionCheckService) {
        return this.filterUnPermitted(persons, HenkiloDto::getOidHenkilo, allowedRoles, permissionCheckService);
    }

    @Override
    public List<HenkiloPerustietoDto> filterUnpermittedHenkiloPerustieto(Collection<HenkiloPerustietoDto> persons,
                                                                         Map<String, List<String>> allowedRoles,
                                                                         ExternalPermissionService permissionCheckService) {
        return this.filterUnPermitted(persons, HenkiloPerustietoDto::getOidHenkilo, allowedRoles, permissionCheckService);
    }

    private <T> List<T> filterUnPermitted(Collection<T> persons, Function<T, String> getOid, Map<String, List<String>> allowedRoles, ExternalPermissionService permissionCheckService) {
        if (persons == null) {
            return new ArrayList<>();
        }
        return persons.stream()
                .filter(person -> this.isAllowedToReadPerson(getOid.apply(person), allowedRoles, permissionCheckService))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, HenkiloDto> filterUnpermittedHenkilo(Map<String, HenkiloDto> persons, Map<String, List<String>> allowedRoles,
                                                            ExternalPermissionService permissionCheckService) {
        if (persons == null || persons.isEmpty()) {
            return new HashMap<>();
        }

        Map<String, HenkiloDto> permissionCheckedPersons = new HashMap<>();
        for (Map.Entry<String, HenkiloDto> person : persons.entrySet()) {
            if (person.getValue() != null && this.isAllowedToReadPerson(person.getValue().getOidHenkilo(), allowedRoles, permissionCheckService)) {
                permissionCheckedPersons.put(person.getKey(), person.getValue());
            }
        }
        return permissionCheckedPersons;
    }

    @Override
    public boolean isAllowedToModifyPerson(String userOid, Map<String, List<String>> allowedPalveluRooli,
                                           ExternalPermissionService externalPermissionService) {
        if (this.isSuperUser() || this.isOwnData(userOid)) {
            return true;
        }
        return isAllowedToAccessPerson(userOid, (callingUserOid, callingUserRoles)
                -> kayttooikeusClient.checkUserPermissionToUserByPalveluRooli(callingUserOid, userOid, allowedPalveluRooli, externalPermissionService, callingUserRoles)
        );
    }

    @Override
    public boolean isAllowedToReadPerson(String userOid, Map<String, List<String>> allowedPalveluRooli,
                                         ExternalPermissionService externalPermissionService) {
        if (this.isSuperUserOrCanReadAll() || this.isOwnData(userOid)) {
            return true;
        }
        return isAllowedToAccessPerson(userOid, (callingUserOid, callingUserRoles)
                -> kayttooikeusClient.checkUserPermissionToUserByPalveluRooli(callingUserOid, userOid, allowedPalveluRooli, externalPermissionService, callingUserRoles)
        );
    }

    private boolean isAllowedToAccessPerson(String userOid, BiFunction<String, Set<String>, Boolean> hasPermissionFunction) {
        Set<String> callingUserRoles = this.getCasRoles();
        if (callingUserRoles.contains(ROLE_OPPIJOIDENTUONTI)) {
            // sallitaan tietojen käsittely jos virkailija ja oppija
            // ovat samassa organisaatiossa (ja virkailijalla on
            // oppijoiden tuonti -rooli kyseiseen organisaatioon)
            List<String> organisaatioOids = organisaatioRepository.findOidByHenkiloOid(userOid);
            if (!organisaatioOids.isEmpty()) {
                if (getOrganisaatioOids(PALVELU_OPPIJANUMEROREKISTERI, KAYTTOOIKEUS_OPPIJOIDENTUONTI).stream()
                        .flatMap(organisaatioOid -> Stream.concat(Stream.of(organisaatioOid),
                                organisaatioService.getChildOids(organisaatioOid, true, OrganisaatioTilat.aktiivisetJaLakkautetut()).stream()))
                        .anyMatch(organisaatioOids::contains)) {
                    return true;
                }
            }
        }
        String callingUserOid = this.userDetailsHelper.getCurrentUserOid();
        return hasPermissionFunction.apply(callingUserOid, callingUserRoles);
    }

    @Override
    public Set<String> getOrganisaatioOids() {
        return getOrganisaatioOids(rooli -> true);
    }

    @Override
    public Set<String> getOrganisaatioOids(String palvelu, String kayttooikeus) {
        final String haluttuRooli = String.format("ROLE_APP_%s_%s", palvelu, kayttooikeus);
        return getOrganisaatioOids(kayttajanRooli -> kayttajanRooli.startsWith(haluttuRooli));
    }

    @Override
    public Set<String> getOrganisaatioOidsByKayttaja(final String palvelu, final String... oikeudet) {
        return Arrays.asList(oikeudet).stream()
                .map(kayttooikeus -> getOrganisaatioOids(palvelu, kayttooikeus).stream())
                .reduce(Stream::concat)
                .orElse(Stream.empty())
                .collect(toSet());
    }

    @Override
    public Set<String> getAllOrganisaatioOids(final String palvelu, final String... oikeudet) {
        return getOrganisaatioOidsByKayttaja(palvelu, oikeudet).stream()
                .flatMap(organisaatioOid -> Stream.concat(Stream.of(organisaatioOid),
                        organisaatioService.getChildOids(organisaatioOid, true, OrganisaatioTilat.aktiivisetJaLakkautetut()).stream()))
                .collect(toSet());
    }

    private Set<String> getOrganisaatioOids(Predicate<String> rooliPredicate) {
        return getCasRoles().stream()
                .filter(rooliPredicate)
                .map(rooli -> rooli.substring(rooli.lastIndexOf("_") + 1))
                .filter(str -> str.startsWith(ORGANISAATIO_OID_PREFIX))
                .collect(toSet());
    }

    @Override
    public boolean isSuperUser() {
        return this.isSuperUser(this.getCasRoles());
    }

    @Override
    public boolean isSuperUserOrCanReadAll() {
        return this.isSuperUser() || this.isReadAllUser(this.getCasRoles());
    }

    private boolean isSuperUser(Set<String> roles) {
        String rekisterinpitajaroolit = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX;
        return roles.stream().anyMatch(rekisterinpitajaroolit::equals);
    }

    private boolean isReadAllUser(Set<String> roles) {
        String readAllUserRoles = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA_READ" + ROOT_ORGANISATION_SUFFIX;
        return roles.stream().anyMatch(readAllUserRoles::equals);
    }

    private boolean isOwnData(String dataHenkiloOid) {
        return this.userDetailsHelper.getCurrentUserOid().equals(dataHenkiloOid);
    }

    private Set<String> getCasRoles() {
        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        return authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
    }

}
