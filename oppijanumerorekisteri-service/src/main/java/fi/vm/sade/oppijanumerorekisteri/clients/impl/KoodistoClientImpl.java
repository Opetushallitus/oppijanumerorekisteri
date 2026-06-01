package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class KoodistoClientImpl implements KoodistoClient {
    private final ObjectMapper objectMapper;
    private final RetryingAnonymousOphClient httpClient;

    @Value("${koodisto-service.koodi}")
    private String getKoodiUriTemplate;

    @Override
    public List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis) {
        try {
            var url = UriComponentsBuilder.fromUriString(getKoodiUriTemplate)
                    .queryParam("onlyValidKoodis", onlyValidKoodis)
                    .queryParam("koodistoVersio", koodistoVersio)
                    .buildAndExpand(Map.of("koodistoUri", koodistoUri))
                    .toUriString();
            var requestBuilder = HttpRequest.newBuilder()
                .uri(new URI(url))
                .GET();
            HttpResponse<String> response = httpClient.sendRequestWithRetry(requestBuilder);
            if (response.statusCode() == 200) {
                return Arrays.asList(objectMapper.readValue(response.body(), KoodiType[].class));
            } else {
                throw new RuntimeException("Unexpected response status");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
