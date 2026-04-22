package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.clients.cas.CasClient;
import fi.vm.sade.properties.OphProperties;
import lombok.RequiredArgsConstructor;

import java.net.CookieManager;
import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import tools.jackson.databind.ObjectMapper;

@Configuration
@RequiredArgsConstructor
public class ClientConfiguration {
    @Value("${ataru.baseurl}")
    private String ataruBaseUrl;
    @Value("${authentication.ataru.username}")
    private String ataruUsername;
    @Value("${authentication.ataru.password}")
    private String ataruPassword;

    @Value("${haku-app.baseurl}")
    private String hakuAppBaseurl;
    @Value("${authentication.hakuapp.username}")
    private String hakuAppUsername;
    @Value("${authentication.hakuapp.password}")
    private String hakuAppPassword;

    @Bean
    public AtaruClient ataruClient(OphProperties properties, ObjectMapper objectMapper) {
        var casBase = properties.require("cas.url");
        var httpClient = HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .connectTimeout(Duration.ofSeconds(60))
                .build();
        var casClient = new CasClient(httpClient, casBase, ataruUsername, ataruPassword, "");
        return new AtaruClient(httpClient, casClient, ataruBaseUrl, objectMapper);
    }

    @Bean
    public HakuappClient hakuappClient(OphProperties properties, ObjectMapper objectMapper) {
        var casBase = properties.require("cas.url");
        var httpClient = HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .connectTimeout(Duration.ofSeconds(60))
                .build();
        var casClient = new CasClient(httpClient, casBase, hakuAppUsername, hakuAppPassword);
        return new HakuappClient(httpClient, casClient, hakuAppBaseurl, objectMapper);
    }
}
