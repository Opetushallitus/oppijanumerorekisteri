package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import java.net.CookieManager;
import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RetryingAnonymousOphClientConfiguration {
    @Bean
    RetryingAnonymousOphClient client() {
        var httpClient = HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        return new RetryingAnonymousOphClient(httpClient);
    }
}
