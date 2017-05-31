package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import fi.vm.sade.generic.rest.CachingRestClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.exceptions.HttpConnectionException;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class VtjClientImpl implements VtjClient {
    private final UrlConfiguration urlConfiguration;

    private static CachingRestClient restClient = new CachingRestClient()
            .setClientSubSystemCode("henkilo.authentication-service")
            .setAllowUrlLogging(false);

    @Autowired
    public VtjClientImpl(UrlConfiguration urlConfiguration,
                         AuthenticationProperties authenticationProperties) {
        this.urlConfiguration = urlConfiguration;
        restClient.setWebCasUrl(this.urlConfiguration.url("cas.url"));
        restClient.setUsername(authenticationProperties.getVtj().getUsername());
        restClient.setPassword(authenticationProperties.getVtj().getPassword());
        restClient.setCasService(this.urlConfiguration.url("vtj-service.security-check"));
    }

    @Override
    public Optional<YksiloityHenkilo> fetchHenkilo(String hetu) {
        String vtjUrl = this.urlConfiguration.url("vtj-service.url", hetu);
        try {
            return Optional.ofNullable(restClient.get(vtjUrl, YksiloityHenkilo.class));
        } catch (IOException e) {
            throw new HttpConnectionException();
        }
    }

}
