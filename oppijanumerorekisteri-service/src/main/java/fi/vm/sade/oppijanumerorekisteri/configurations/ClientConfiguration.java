package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.javautils.httpclient.ApacheOphHttpClient;
import fi.vm.sade.javautils.httpclient.OphHttpClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClientConfiguration {
    private UrlConfiguration urlConfiguration;

    @Autowired
    public ClientConfiguration(UrlConfiguration urlConfiguration) {
        this.urlConfiguration = urlConfiguration;
    }

    @Bean
    public OphHttpClient ophHttpClient() {
        int timeOut = 10000;
        long connectionLives = 600;
        return ApacheOphHttpClient
                .createDefaultOphHttpClient(ConfigEnums.SUBSYSTEMCODE.value(), this.urlConfiguration, timeOut, connectionLives);
    }
}
