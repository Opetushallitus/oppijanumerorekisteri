package fi.vm.sade.henkiloui.configurations;

import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.properties.OphProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

@Configuration
public class HttpClientConfiguration {

    private static final String CALLER_ID = "1.2.246.562.10.00000000001.henkilo-ui";

    @Bean
    @Primary
    OphHttpClient ophHttpClient() {
        return new OphHttpClient.Builder(CALLER_ID)
                .build();
    }

    @Bean
    @Qualifier("lokalisointi")
    OphHttpClient ophHttpClientLokalisointi(OphProperties ophProperties, Environment environment) {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .webCasUrl(ophProperties.url("cas.url"))
                .casServiceUrl(ophProperties.url("lokalisointi.login"))
                .username(environment.getRequiredProperty("henkiloui.palvelukayttajat.lokalisointi.kayttajatunnus"))
                .password(environment.getRequiredProperty("henkiloui.palvelukayttajat.lokalisointi.salasana"))
                .build();
        return new OphHttpClient.Builder(CALLER_ID)
                .authenticator(authenticator)
                .build();
    }

}
