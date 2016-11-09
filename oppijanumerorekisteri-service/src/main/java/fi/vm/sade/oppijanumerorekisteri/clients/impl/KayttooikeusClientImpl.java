package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.generic.rest.CachingRestClient;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8;

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
                                             ExternalPermissionService externalPermissionService, Set<String> callingUserRoles) {
        String url = this.urlConfiguration.url("kayttooikeus-service.s2s-checkUserPermissionToUser");
//        return cachingRestClient.post(url, APPLICATION_JSON_UTF8.getType(), "{}");
        return true;
    }

}
