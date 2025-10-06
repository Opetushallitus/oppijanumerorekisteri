package fi.vm.sade.oppijanumerorekisteri.clients;

import static fi.vm.sade.oppijanumerorekisteri.configurations.CacheConfiguration.CACHE_NAME_OAUTH2_BEARER;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.clients.model.Oauth2Token;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@CacheConfig(cacheNames = CACHE_NAME_OAUTH2_BEARER)
@RequiredArgsConstructor
public class Oauth2BearerClient {
    private final ObjectMapper objectMapper;
    private final OppijanumerorekisteriProperties properties;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String oauth2IssuerUri;

    @Cacheable(value = CACHE_NAME_OAUTH2_BEARER, sync = true)
    public String getOauth2Bearer() throws IOException, InterruptedException {
        String tokenUrl = oauth2IssuerUri + "/oauth2/token";
        log.info("refetching oauth2 bearer from " + tokenUrl);
        String body = "grant_type=client_credentials&client_id="
                + properties.getOauth2().getClientId()
                + "&client_secret="
                + properties.getOauth2().getClientSecret();
        var request = HttpRequest.newBuilder()
                .uri(URI.create(tokenUrl))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(BodyPublishers.ofString(body))
                .build();
        var client = HttpClient.newHttpClient();
        HttpResponse<String> res = client.send(request, BodyHandlers.ofString());
        if (res.statusCode() != 200) {
            throw new RuntimeException("Oauth2 bearer returned status code " + res.statusCode() + ": " + res.body());
        }
        log.info("oauth2 bearer body: " + res.body());
        return objectMapper.readValue(res.body(), Oauth2Token.class).getAccess_token();
    }

    @CacheEvict(value = CACHE_NAME_OAUTH2_BEARER, allEntries = true)
    public void evictOauth2Bearer() {
        log.info("evicting oauth2 bearer cache");
    }
}
