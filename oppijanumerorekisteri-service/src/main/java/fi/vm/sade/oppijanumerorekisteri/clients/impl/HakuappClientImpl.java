package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import fi.vm.sade.generic.rest.CachingRestClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import org.apache.http.HttpResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

import static fi.vm.sade.javautils.httpclient.OphHttpClient.JSON;

@Component
public class HakuappClientImpl implements HakuappClient {

    private final ObjectMapper objectMapper;
    private final UrlConfiguration urlConfiguration;
    private final static CachingRestClient cachingRestClient = new CachingRestClient()
            .setClientSubSystemCode("oppijanumerorekisteri.oppijanumerorekisteri-service");

    @Autowired
    public HakuappClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                             AuthenticationProperties authenticationProperties) {
        this.objectMapper = objectMapper;
        this.urlConfiguration = urlConfiguration;
        cachingRestClient.setWebCasUrl(this.urlConfiguration.url("cas.url"));
        cachingRestClient.setCasService(this.urlConfiguration.url("cas.service.haku-app"));
        cachingRestClient.setUsername(authenticationProperties.getHakuapp().getUsername());
        cachingRestClient.setPassword(authenticationProperties.getHakuapp().getPassword());
    }

    @Override
    public Map<String, List<HakemusDto>> fetchApplicationsByOid(Set<String> oids) {
        String url = this.urlConfiguration.url("haku-app.applications");
        try {
            HttpResponse response = cachingRestClient.post(url, JSON, objectMapper.writeValueAsString(Sets.newHashSet(oids)));
            Map<String, List<Map<String, Object>>> applicationsByPersonOid = objectMapper.readValue(
                    response.getEntity().getContent(), new TypeReference<Map<String, List<Map<String, Object>>>>(){});
            Map<String, List<HakemusDto>> hakemuksetByHenkiloOid = new HashMap<>();
            applicationsByPersonOid.keySet().forEach( henkiloOid -> {
                List<Map<String, Object>> hakemukset = applicationsByPersonOid.get(henkiloOid);
                List<HakemusDto> hakemusList = hakemukset.stream().map(hakemusData -> {
                    hakemusData.put("service", "haku-app");
                    return new HakemusDto(hakemusData);
                }).collect(Collectors.toList());

                hakemuksetByHenkiloOid.put(henkiloOid, hakemusList);
            });

            return hakemuksetByHenkiloOid;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed fetching hakemuksetDto for henkilos: " + oids.toString(), e);
        } catch (IOException e) {
            throw new RuntimeException("Failed fetching hakemuksetDto for henkilos: " + oids.toString(), e);
        }

    }
}
