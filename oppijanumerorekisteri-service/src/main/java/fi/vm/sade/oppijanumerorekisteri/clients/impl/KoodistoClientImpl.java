package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.httpclient.OphHttpClient;
import fi.vm.sade.javautils.httpclient.apache.ApacheOphHttpClient;
import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static fi.vm.sade.javautils.httpclient.OphHttpClient.JSON;

@Component
@RequiredArgsConstructor
public class KoodistoClientImpl implements KoodistoClient {
    private final ObjectMapper objectMapper;
    private OphHttpClient httpClient;
    private final AuthenticationProperties authenticationProperties;
    private final UrlConfiguration urlConfiguration;

    @PostConstruct
    public void setup() {
        this.httpClient = ApacheOphHttpClient.createDefaultOphClient(ConfigEnums.CALLER_ID.value(), null, 10000, 60);
    }

    @Override
    public List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis) {
        Map<String, String> queryParams = new HashMap<>();
        queryParams.put("onlyValidKoodis", String.valueOf(onlyValidKoodis));
        if (koodistoVersio > 0) {
            queryParams.put("koodistoVersio", String.valueOf(koodistoVersio));
        }
        String url = urlConfiguration.url("koodisto-service.koodi", koodistoUri, queryParams);
        KoodiType[] koodiCollectionType = this.httpClient
                .get(url)
                .expectStatus(200).accept(JSON)
                .retryOnError(3)
                .execute(r -> objectMapper.readValue(r.asInputStream(), KoodiType[].class));
        return Arrays.asList(koodiCollectionType);
    }
}
