package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final UrlConfiguration urlConfiguration;

    @Override
    public List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis) {
        try {
            Map<String, String> queryParams = new HashMap<>();
            queryParams.put("onlyValidKoodis", String.valueOf(onlyValidKoodis));
            if (koodistoVersio > 0) {
                queryParams.put("koodistoVersio", String.valueOf(koodistoVersio));
            }
            String url = urlConfiguration.url("koodisto-service.koodi", koodistoUri, queryParams);
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
