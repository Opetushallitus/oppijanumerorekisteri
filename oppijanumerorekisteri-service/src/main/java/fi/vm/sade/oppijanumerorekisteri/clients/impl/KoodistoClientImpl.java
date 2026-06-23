package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import tools.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

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

    @Value("${virkailija.baseurl}")
    private String virkailijaBaseUrl;

    @Override
    public List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis) {
        try {
            Map<String, String> queryParams = new HashMap<>();
            queryParams.put("onlyValidKoodis", String.valueOf(onlyValidKoodis));
            if (koodistoVersio > 0) {
                queryParams.put("koodistoVersio", String.valueOf(koodistoVersio));
            }
            UriComponentsBuilder url = UriComponentsBuilder.fromUriString(virkailijaBaseUrl)
                .pathSegment("koodisto-service", "rest", "json", koodistoUri, "koodi");
            queryParams.forEach(url::queryParam);
            var requestBuilder = HttpRequest.newBuilder()
                .uri(new URI(url.toUriString()))
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
