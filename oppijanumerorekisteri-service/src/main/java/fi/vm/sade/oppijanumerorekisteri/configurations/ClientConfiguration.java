package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.clients.cas.CasClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.properties.OphProperties;
import lombok.RequiredArgsConstructor;

import java.net.CookieManager;
import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@RequiredArgsConstructor
public class ClientConfiguration {
    private final AuthenticationProperties authenticationProperties;

    @Value("${ataru.baseurl}")
    private String ataruBaseUrl;
    @Value("${haku-app.baseurl}")
    private String hakuAppBaseurl;

    @Bean
    public AtaruClient ataruClient(OphProperties properties, ObjectMapper objectMapper) {
        var casBase = properties.require("cas.url");

        var httpClient = HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .connectTimeout(Duration.ofSeconds(60))
                .build();
        var casClient = new CasClient(
                httpClient,
                casBase,
                authenticationProperties.getAtaru().getUsername(),
                authenticationProperties.getAtaru().getPassword(),
                ""
        );

        return new AtaruClient(httpClient, casClient, ataruBaseUrl, objectMapper);
    }

    @Bean
    public HakuappClient hakuappClient(OphProperties properties, ObjectMapper objectMapper) {
        var casBase = properties.require("cas.url");

        var httpClient = HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .connectTimeout(Duration.ofSeconds(60))
                .build();
        var casClient = new CasClient(
                httpClient,
                casBase,
                authenticationProperties.getHakuapp().getUsername(),
                authenticationProperties.getHakuapp().getPassword()
        );

        return new HakuappClient(httpClient, casClient, hakuAppBaseurl, objectMapper);
    }
}
