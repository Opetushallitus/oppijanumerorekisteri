package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.generic.rest.CachingRestClient;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Component
public class AtaruClientImpl implements AtaruClient{

    private final ObjectMapper objectMapper;
    private final UrlConfiguration urlConfiguration;
    private final static CachingRestClient cachingRestClient = new CachingRestClient()
            .setClientSubSystemCode("oppijanumerorekisteri.oppijanumerorekisteri-service");

    @Autowired
    public AtaruClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                           AuthenticationProperties authenticationProperties) {
        String username = authenticationProperties.getAtaru().getUsername();
        String password = authenticationProperties.getAtaru().getPassword();

        this.objectMapper = objectMapper;
        this.urlConfiguration = urlConfiguration;
        cachingRestClient.setWebCasUrl(this.urlConfiguration.url("cas.url"));
        cachingRestClient.setCasService(this.urlConfiguration.url("cas.service.ataru"));
        cachingRestClient.setUsername(authenticationProperties.getAtaru().getUsername());
        cachingRestClient.setPassword(authenticationProperties.getAtaru().getPassword());
    }

    @Override
    public Map<String, List<Map<String, Object>>> fetchApplicationsByOid(Set<String> oids) {
      String url = this.urlConfiguration.url("ataru.applications", oids.iterator().next());
        try {
            InputStream response = cachingRestClient.get(url);
            return objectMapper.readValue(
                    response, new TypeReference<Map<String, List<Map<String, Object>>>>(){});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed fetching hakemukset for henkilos: " + oids.toString(), e);
        } catch (IOException e) {
            throw new RuntimeException("Failed fetching hakemukset for henkilos: " + oids.toString(), e);
        }
    }
}
