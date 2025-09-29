package fi.vm.sade.oppijanumerorekisteri.clients;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

import fi.vm.sade.oppijanumerorekisteri.clients.impl.NoContentOrNotFoundException;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class Oauth2Client {
    private final Oauth2BearerClient oauth2BearerClient;

    private HttpResponse<String> execute(HttpRequest.Builder requestBuilder) {
        try {
            var request = requestBuilder
                    .timeout(Duration.ofSeconds(35))
                    .setHeader("Authorization", "Bearer " + oauth2BearerClient.getOauth2Bearer())
                    .setHeader("Caller-Id", ConfigEnums.CALLER_ID.value())
                    .setHeader("CSRF", "CSRF")
                    .setHeader("Cookie", "CSRF=CSRF")
                    .build();
            var client = HttpClient.newBuilder().build();
            var response = client.send(request, BodyHandlers.ofString());
            if (response.statusCode() == 404 || response.statusCode() == 204) {
                throw new NoContentOrNotFoundException(request.uri().toString());
            } else if (response.statusCode() != 401 && (response.statusCode() < 200 || response.statusCode() > 299)) {
                throw new RestClientException(request.uri().toString());
            }
            return response;
        } catch (IOException|InterruptedException e) {
            log.error("error while executing request", e);
            throw new RestClientException("error while executing request", e);
        }
    }

    public HttpResponse<String> executeRequest(HttpRequest.Builder requestBuilder) throws RestClientException {
        HttpResponse<String> res = execute(requestBuilder);
        if (res.statusCode() == 401) {
            log.info("received WWW-authenticate header: " + res.headers().firstValue("WWW-Authenticate"));
            var authHeader = res.headers().firstValue("WWW-Authenticate");
            if (authHeader.orElse("").contains("invalid_token")) {
                oauth2BearerClient.evictOauth2Bearer();
                return execute(requestBuilder);
            }
        }
        return res;
    }
}
