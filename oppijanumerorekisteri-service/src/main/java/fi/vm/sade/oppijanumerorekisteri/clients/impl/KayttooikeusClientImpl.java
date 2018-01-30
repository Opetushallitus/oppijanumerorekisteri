package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.generic.rest.CachingRestClient;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.PermissionCheckDto;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static fi.vm.sade.javautils.httpclient.OphHttpClient.JSON;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.kayttooikeus.dto.OrganisaatioHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioCriteria;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import java.util.Optional;
import static java.util.stream.Collectors.toSet;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClientException;

@Component
public class KayttooikeusClientImpl implements KayttooikeusClient {
    private final ObjectMapper objectMapper;
    private final UrlConfiguration urlConfiguration;
    // Static so caching is used properly.
    private final static CachingRestClient cachingRestClient = new CachingRestClient()
            .setClientSubSystemCode("oppijanumerorekisteri.oppijanumerorekisteri-service");

    @Autowired
    public KayttooikeusClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                                  AuthenticationProperties authenticationProperties) {
        this.objectMapper = objectMapper;
        this.urlConfiguration = urlConfiguration;
        cachingRestClient.setWebCasUrl(this.urlConfiguration.url("cas.url"));
        cachingRestClient.setCasService(this.urlConfiguration.url("kayttooikeus-service.security-check"));
        cachingRestClient.setUsername(authenticationProperties.getKayttooikeus().getUsername());
        cachingRestClient.setPassword(authenticationProperties.getKayttooikeus().getPassword());
    }

    @Override
    public Optional<KayttajaReadDto> getKayttajaByOid(String oid) {
        String url = urlConfiguration.url("kayttooikeus-service.henkilo.byOid", oid);
        try {
            KayttajaReadDto dto = cachingRestClient.get(url, KayttajaReadDto.class);
            return Optional.of(dto);
        } catch (CachingRestClient.HttpException ex) {
            if (ex.getStatusCode() == HttpStatus.OK.value()) {
                return Optional.empty();
            }
            throw new RestClientException(ex.getMessage(), ex);
        } catch (IOException ex) {
            throw new RestClientException(ex.getMessage(), ex);
        }
    }

    @Override
    @Deprecated
    public boolean checkUserPermissionToUser(String callingUserOid, String userOid, List<String> allowedRoles,
                                             ExternalPermissionService externalPermissionService, Set<String> callingUserRoles) {
        PermissionCheckDto permissionCheckDto = new PermissionCheckDto();
        permissionCheckDto.setAllowedRoles(allowedRoles);
        permissionCheckDto.setCallingUserOid(callingUserOid);
        permissionCheckDto.setCallingUserRoles(callingUserRoles);
        permissionCheckDto.setExternalPermissionService(externalPermissionService);
        permissionCheckDto.setUserOid(userOid);
        String url = this.urlConfiguration.url("kayttooikeus-service.s2s-checkUserPermissionToUser");
        Boolean content;
        try {
            content = this.objectMapper.readerFor(Boolean.class)
                    .readValue(cachingRestClient.post(url, JSON, this.objectMapper.writeValueAsString(permissionCheckDto))
                            .getEntity().getContent());
        } catch (IOException e) {
            throw new RestClientException(e.getMessage(), e);
        }
        return content;
    }

    @Override
    public boolean checkUserPermissionToUserByPalveluRooli(String callingUserOid, String userOid, Map<String, List<String>> allowedPalveluRooli,
                                             ExternalPermissionService externalPermissionService, Set<String> callingUserRoles) {
        PermissionCheckDto permissionCheckDto = new PermissionCheckDto();
        permissionCheckDto.setAllowedPalveluRooli(allowedPalveluRooli);
        permissionCheckDto.setCallingUserOid(callingUserOid);
        permissionCheckDto.setCallingUserRoles(callingUserRoles);
        permissionCheckDto.setExternalPermissionService(externalPermissionService);
        permissionCheckDto.setUserOid(userOid);
        String url = this.urlConfiguration.url("kayttooikeus-service.s2s-checkUserPermissionToUser");
        Boolean content;
        try {
            content = this.objectMapper.readerFor(Boolean.class)
                    .readValue(cachingRestClient.post(url, JSON, this.objectMapper.writeValueAsString(permissionCheckDto))
                            .getEntity().getContent());
        } catch (IOException e) {
            throw new RestClientException(e.getMessage(), e);
        }
        return content;
    }

    @Override
    public void passivoiHenkilo(String oidHenkilo, String kasittelijaOid) {
        String url = this.urlConfiguration.url("kayttooikeus-service.henkilo-passivoi", oidHenkilo, kasittelijaOid);
        try {
            cachingRestClient.delete(url);
        } catch (IOException e) {
            throw new RestClientException(e.getMessage(), e);
        }
    }

    @Override
    public KayttooikeudetDto getHenkiloKayttooikeudet(String henkiloOid, OrganisaatioCriteria criteria) {
        String url = urlConfiguration.url("kayttooikeus-service.henkilo.sallitut", henkiloOid);
        return getHenkiloKayttooikeudetByUrl(url, criteria);
    }

    private KayttooikeudetDto getHenkiloKayttooikeudetByUrl(String url, OrganisaatioCriteria criteria) {
        try {
            String request = objectMapper.writeValueAsString(criteria);
            try (InputStream response = cachingRestClient.post(url, JSON, request).getEntity().getContent()) {
                KayttooikeudetDto kayttooikeudet = objectMapper.readValue(response, KayttooikeudetDto.class);
                if (!kayttooikeudet.isAdmin() && kayttooikeudet.getOids() == null) {
                    throw new DataInconsistencyException("Käyttöoikeuspalvelu palautti epäkonsistenttia tietoa");
                }
                return kayttooikeudet;
            }
        } catch (IOException e) {
            throw new RestClientException(e.getMessage(), e);
        }
    }

    @Override
    public List<OrganisaatioHenkiloDto> getOrganisaatioHenkilot(String henkiloOid) {
        try {
            String url = urlConfiguration.url("kayttooikeus-service.henkilo.organisaatiohenkilo", henkiloOid);
            try (InputStream response = cachingRestClient.get(url)) {
                return objectMapper.readValue(response, new TypeReference<List<OrganisaatioHenkiloDto>>() {});
            }
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public Set<String> getAktiivisetOrganisaatioHenkilot(String henkiloOid) {
        return getOrganisaatioHenkilot(henkiloOid).stream()
                .filter(organisaatioHenkilo -> !organisaatioHenkilo.isPassivoitu())
                .map(OrganisaatioHenkiloDto::getOrganisaatioOid)
                .collect(toSet());
    }

    @Override
    public void ldapSynkroniseHenkilo(String henkiloOid) {
        try {
            Map<String, String> queryParams = new HashMap<>();
            queryParams.put("ldapSynchronization", "NORMAL");
            String url = this.urlConfiguration.url("kayttooikeus-service.henkilo.ldap-synkronoi", henkiloOid, queryParams);
            cachingRestClient.put(url, JSON, "{}");
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }
    }

}
