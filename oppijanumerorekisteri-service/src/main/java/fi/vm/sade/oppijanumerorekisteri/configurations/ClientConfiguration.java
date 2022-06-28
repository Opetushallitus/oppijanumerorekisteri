package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.javautils.httpclient.OphHttpClient;
import fi.vm.sade.javautils.httpclient.apache.ApacheOphHttpClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ClientConfiguration {

    private final UrlConfiguration urlConfiguration;
    private final AuthenticationProperties authenticationProperties;

    @Bean(name = "anonymousClient")
    public OphHttpClient ophHttpClient() {
        int timeOut = 10000;
        long connectionLives = 600;
        return ApacheOphHttpClient
                .createDefaultOphClient(ConfigEnums.CALLER_ID.value(), this.urlConfiguration, timeOut, connectionLives);
    }

    @Bean(name = "ataruClient")
    public fi.vm.sade.javautils.http.OphHttpClient ataruHttpClient() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getAtaru().getUsername())
                .password(authenticationProperties.getAtaru().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("cas.service.ataru"))
                .casServiceSessionInitUrl(urlConfiguration.url("cas.service.ataru"))
                .sessionCookieName("ring-session")
                .addSpringSecSuffix(false)
                .build();

        return new fi.vm.sade.javautils.http.OphHttpClient.Builder(ConfigEnums.CALLER_ID.value()).authenticator(authenticator).build();
    }
}
