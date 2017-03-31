package fi.vm.sade.oppijanumerorekisteri.clients.impl;

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
import java.util.List;
import java.util.Set;

import static fi.vm.sade.javautils.httpclient.OphHttpClient.JSON;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;

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
    public boolean checkUserPermissionToUser(String callingUserOid, String userOid, List<String> allowedRoles,
                                             ExternalPermissionService externalPermissionService, Set<String> callingUserRoles)
            throws IOException {
        PermissionCheckDto permissionCheckDto = new PermissionCheckDto();
        permissionCheckDto.setAllowedRoles(allowedRoles);
        permissionCheckDto.setCallingUserOid(callingUserOid);
        permissionCheckDto.setCallingUserRoles(callingUserRoles);
        permissionCheckDto.setExternalPermissionService(externalPermissionService);
        permissionCheckDto.setUserOid(userOid);
        String url = this.urlConfiguration.url("kayttooikeus-service.s2s-checkUserPermissionToUser");
        InputStream content = cachingRestClient.post(url, JSON, this.objectMapper.writeValueAsString(permissionCheckDto))
                .getEntity().getContent();
        return this.objectMapper.readerFor(Boolean.class).readValue(content);
    }

    @Override
    public void passivoiHenkilo(String oidHenkilo, String kasittelijaOid) throws IOException {
        String url = this.urlConfiguration.url("kayttooikeus-service.henkilo-passivoi", oidHenkilo, kasittelijaOid);
        cachingRestClient.delete(url);
    }

    @Override
    public KayttooikeudetDto getHenkiloKayttooikeudet(String henkiloOid) {
        String url = urlConfiguration.url("kayttooikeus-service.henkilo.sallitut", henkiloOid);
        return getHenkiloKayttooikeudetByUrl(url);
    }

    @Override
    public KayttooikeudetDto getHenkiloKayttooikeudet(String henkiloOid, String organisaatioOid) {
        String url = urlConfiguration.url("kayttooikeus-service.henkilo.sallitut-by-organisaatio", henkiloOid, organisaatioOid);
        return getHenkiloKayttooikeudetByUrl(url);
    }

    private KayttooikeudetDto getHenkiloKayttooikeudetByUrl(String url) {
        try {
            String json = cachingRestClient.getAsString(url);
            KayttooikeudetDto kayttooikeudet = objectMapper.readValue(json, KayttooikeudetDto.class);
            if (!kayttooikeudet.isAdmin() && kayttooikeudet.getOids() == null) {
                throw new DataInconsistencyException("Käyttöoikeuspalvelu palautti epäkonsistenttia tietoa");
            }
            return kayttooikeudet;
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

}
