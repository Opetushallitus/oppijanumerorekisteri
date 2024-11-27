package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class RetryingAnonymousOphClient {
    private final HttpClient httpClient;

    public HttpResponse<String> sendRequestWithRetry(HttpRequest.Builder requestBuilder) {
        return sendRequestWithRetry(requestBuilder, 3, Duration.ofSeconds(2));
    }

    public HttpResponse<String> sendRequestWithRetry(HttpRequest.Builder requestBuilder, int retryCount, Duration duration) {
        for (int i = 0; i < retryCount; i++) {
            try {
                if (i > 0) {
                    Thread.sleep(duration);
                }
                HttpResponse<String> res = sendRequest(requestBuilder);
                if (res.statusCode() < 200 || res.statusCode() > 499) {
                    continue;
                }
                return res;
            } catch (InterruptedException | IOException e) {
                continue;
            }
        }
        throw new RuntimeException("failed to request after " + retryCount + " retries");
    }

    public HttpResponse<String> sendRequest(HttpRequest.Builder requestBuilder) throws IOException, InterruptedException {
        HttpRequest request = requestBuilder
                .timeout(Duration.ofSeconds(35))
                .header("Caller-Id", ConfigEnums.CALLER_ID.value())
                .header("CSRF", "CSRF")
                .header("Cookie", "CSRF=CSRF")
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
