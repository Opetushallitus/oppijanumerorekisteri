package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
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

    @Bean(name = "ataruClient")
    public OphHttpClient ataruHttpClient() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getAtaru().getUsername())
                .password(authenticationProperties.getAtaru().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("cas.service.ataru"))
                .casServiceSessionInitUrl(urlConfiguration.url("cas.service.ataru"))
                .sessionCookieName("ring-session")
                .addSpringSecSuffix(false)
                .build();

        return new OphHttpClient
                .Builder(ConfigEnums.CALLER_ID.value())
                .timeoutMs(60000)
                .setSocketTimeoutMs(60000)
                .authenticator(authenticator).build();
    }
}
