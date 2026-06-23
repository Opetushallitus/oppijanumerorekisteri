package fi.vm.sade.oppijanumerorekisteri.clients.viestinvalitys;

import tools.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.clients.cas.CasClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.CookieManager;
import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
@Slf4j
public class ViestinvalitysConfig {
    @Value("${cas.url}")
    private String casBase;

    @Value("${viestinvalitys.baseurl}")
    private String viestinvalitysUrl;
    @Value("${authentication.viestintapalvelu.username}")
    private String username;
    @Value("${authentication.viestintapalvelu.password}")
    private String password;

    @Bean
    public ViestinvalitysClient viestinvalitysClient(ObjectMapper objectMapper) {
        var httpClient = HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        var casClient = new CasClient(httpClient, casBase, username, password);

        return new ViestinvalitysClient(httpClient, casClient, viestinvalitysUrl, objectMapper);
    }
}

