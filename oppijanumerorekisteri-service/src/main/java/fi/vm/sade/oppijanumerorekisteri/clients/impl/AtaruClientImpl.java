package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.OphHttpResponse;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class AtaruClientImpl implements AtaruClient{

    private final ObjectMapper objectMapper;
    private final UrlConfiguration urlConfiguration;
    private final AuthenticationProperties authenticationProperties;
    private final OphHttpClient ophHttpClient;

    @Autowired
    public AtaruClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                           AuthenticationProperties authenticationProperties) {
        this.authenticationProperties = authenticationProperties;
        this.objectMapper = objectMapper;
        this.urlConfiguration = urlConfiguration;
        this.ophHttpClient = createOphHttpClient();
    }

    @Override
    public Map<String, List<Map<String, Object>>> fetchApplicationsByOid(Set<String> oids) {
        TypeReference<List<Map<String, Object>>> hakemusType = new TypeReference<List<Map<String, Object>>>() {};

        Map<String, List<Map<String, Object>>> collect = oids.stream()
                .collect(Collectors.toMap(Function.identity(), oid -> {
                    OphHttpResponse response = makeRequest(oid);
                    if (response.getStatusCode() == 200) {
                        try (InputStream is = response.asInputStream()) {
                            return objectMapper.readValue(is, hakemusType);

                        } catch (IOException e) {
                            log.error("Failed to read ataru response: {}", e);
                            return Collections.emptyList();
                        }
                    }
                    return Collections.emptyList();
                }));
        return collect;
    }

    private OphHttpResponse makeRequest(String oid) {
        String url = urlConfiguration.url("ataru.applications", oid);
        OphHttpRequest request = OphHttpRequest.Builder.get(url).build();
        return this.ophHttpClient.execute(request);
    }

    private OphHttpClient createOphHttpClient() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getAtaru().getUsername())
                .password(authenticationProperties.getAtaru().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("cas.service.ataru"))
                .casServiceSessionInitUrl(urlConfiguration.url("cas.service.ataru"))
                .sessionCookieName("ring-session")
                .addSpringSecSuffix(false)
                .build();

        return new OphHttpClient.Builder().authenticator(authenticator).build();
    }
}
