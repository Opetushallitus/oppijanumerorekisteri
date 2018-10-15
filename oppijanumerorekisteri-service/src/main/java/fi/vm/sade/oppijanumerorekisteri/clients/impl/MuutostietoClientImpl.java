package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.OphHttpResponse;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.oppijanumerorekisteri.clients.MuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

import javax.annotation.PostConstruct;

import static org.apache.http.HttpStatus.SC_OK;

@Component
@Slf4j
@RequiredArgsConstructor
public class MuutostietoClientImpl implements MuutostietoClient {

    private final UrlConfiguration urlConfiguration;
    private final AuthenticationProperties authenticationProperties;
    private OphHttpClient httpClient;
    private final ObjectMapper objectMapper;

    @PostConstruct
    public void setup() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getHenkilotietomuutos().getUsername())
                .password(authenticationProperties.getHenkilotietomuutos().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("henkilotietomuutos-service.security-check"))
                .build();

        this.httpClient = new OphHttpClient.Builder().authenticator(authenticator).build();
    }

    @Override
    public void sendHetus(MuutostietoHetus hetus) {
        OphHttpEntity entity = new OphHttpEntity.Builder()
                .content(serializeHetus(hetus))
                .build();

        try (OphHttpResponse response = httpClient.execute(OphHttpRequest.Builder
                .post(urlConfiguration.url("henkilotietomuutos-service.vtj.hetut"))
                .setEntity(entity).build())) {
            int responseCode = response.getStatusCode();
            if (responseCode == SC_OK) {
                return;
            }
            throw new RestClientException(String.format("Henkilotietomuutos-service returned error status code %d", responseCode));
        }
        catch (Exception e) {
            throw new RestClientException("Error trying to update hetus to henkilotietomuutos-service", e);
        }
    }

    private String serializeHetus(MuutostietoHetus hetus) {
        try {
            return objectMapper.writeValueAsString(hetus);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not serialize muutostietohetus: ", e);
        }
    }

}
