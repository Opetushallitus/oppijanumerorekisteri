package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.oppijanumerorekisteri.clients.RyhmasahkopostiClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.ryhmasahkoposti.api.dto.EmailData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

import javax.annotation.PostConstruct;

import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
public class RyhmasahkopostiClientImpl implements RyhmasahkopostiClient {

    private final ObjectMapper objectMapper;
    private OphHttpClient httpClient;
    private final AuthenticationProperties authenticationProperties;
    private final UrlConfiguration urlConfiguration;


    @PostConstruct
    private void setup() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getViestintapalvelu().getUsername())
                .password(authenticationProperties.getViestintapalvelu().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("ryhmasahkoposti-service.security-check"))
                .build();

        this.httpClient = new OphHttpClient.Builder(ConfigEnums.SUBSYSTEMCODE.value()).authenticator(authenticator).build();
    }

    @Override
    public void sendRyhmaSahkoposti(EmailData emailData) {
        String url = this.urlConfiguration.url("ryhmasahkoposti-service.email");
        OphHttpEntity entity = new OphHttpEntity.Builder()
                .content(serializeEmailData(emailData))
                .build();
        OphHttpRequest request = OphHttpRequest.Builder.post(url).setEntity(entity).build();
        httpClient.<String>execute(request)
                .expectedStatus(200)
                .mapWith(identity())
                .orElseThrow(() -> new RestClientException(String.format("Osoite %s palautti 204 tai 404", url)));
    }

    private String serializeEmailData(EmailData emailData) {
        try {
            return this.objectMapper.writeValueAsString(emailData);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not serialize emaildata: ", e);
        }
    }

}
