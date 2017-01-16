package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.httpclient.ApacheOphHttpClient;
import fi.vm.sade.javautils.httpclient.OphHttpClient;
import fi.vm.sade.koodisto.service.types.common.KoodiCollectionType;
import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.koodisto.service.types.common.KoodistoType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static fi.vm.sade.javautils.httpclient.OphHttpClient.JSON;

@Component
public class KoodistoClientImpl implements KoodistoClient {
    private final ObjectMapper objectMapper;
    // Static so caching is used properly.
    private final OphHttpClient cachingRestClient;

    @Autowired
    public KoodistoClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                                  AuthenticationProperties authenticationProperties) {
        this.objectMapper = objectMapper;
        ApacheOphHttpClient.ApacheHttpClientBuilder builder = ApacheOphHttpClient.createCustomBuilder()
                .createCachingClient(50 * 1000, 10 * 1024 * 1024)
                .setDefaultConfiguration(10000, 60);
        this.cachingRestClient = new OphHttpClient(builder.build(), "oppijanumerorekisteri.oppijanumerorekisteri-service",
                urlConfiguration);
    }

    @Override
    public List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis) {
        KoodiType[] koodiCollectionType = this.cachingRestClient
                .get("koodisto-service.koodi", koodistoUri, Boolean.toString(onlyValidKoodis), Integer.toString(koodistoVersio))
                .expectStatus(200).accept(JSON)
                .execute(r -> objectMapper.readValue(r.asInputStream(), KoodiType[].class));
        return Arrays.asList(koodiCollectionType);
    }

    @Override
    public List<String> getKoodiValuesForKoodisto(String koodistoUri, int koodistoVersion, boolean onlyValidKoodis) {
        return this.getKoodisForKoodisto(koodistoUri, koodistoVersion, onlyValidKoodis)
                .stream().map(KoodiType::getKoodiArvo).collect(Collectors.toList());
    }
}
