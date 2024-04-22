package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Optional;

import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.ioExceptionToRestClientException;

@Component
@RequiredArgsConstructor
public class VtjClientImpl implements VtjClient {

    private OphHttpClient httpClient;
    private final UrlConfiguration urlConfiguration;
    private final ObjectMapper objectMapper;
    private final AuthenticationProperties authenticationProperties;

    @PostConstruct
    public void setup() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getVtj().getUsername())
                .password(authenticationProperties.getVtj().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("vtj-service.security-check"))
                .build();

        this.httpClient = new OphHttpClient.Builder(ConfigEnums.CALLER_ID.value()).authenticator(authenticator).build();
    }

    @Override
    public Optional<YksiloityHenkilo> fetchHenkilo(String hetu) {
        String vtjUrl = this.urlConfiguration.url("vtj-service.url", hetu);
        return httpClient.<YksiloityHenkilo>execute(OphHttpRequest.Builder.get(vtjUrl).build())
                .expectedStatus(200)
                .mapWith(json -> ioExceptionToRestClientException(() -> objectMapper.readValue(json, YksiloityHenkilo.class)));
    }

}
