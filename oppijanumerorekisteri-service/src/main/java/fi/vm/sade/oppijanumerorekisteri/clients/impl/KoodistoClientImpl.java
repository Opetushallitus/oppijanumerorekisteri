package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.httpclient.OphHttpClient;
import fi.vm.sade.javautils.httpclient.apache.ApacheOphHttpClient;
import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

import static fi.vm.sade.javautils.httpclient.OphHttpClient.JSON;

@Component
public class KoodistoClientImpl implements KoodistoClient {
    private final ObjectMapper objectMapper;
    private final OphHttpClient httpClient;

    @Autowired
    public KoodistoClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                                  AuthenticationProperties authenticationProperties) {
        this.objectMapper = objectMapper;
        this.httpClient = ApacheOphHttpClient.createDefaultOphClient("oppijanumerorekisteri.oppijanumerorekisteri-service", urlConfiguration, 10000, 60);
    }

    @Override
    public List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis) {
        KoodiType[] koodiCollectionType = this.httpClient
                .get("koodisto-service.koodi", koodistoUri, Boolean.toString(onlyValidKoodis), Integer.toString(koodistoVersio))
                .expectStatus(200).accept(JSON)
                .retryOnError(3)
                .execute(r -> objectMapper.readValue(r.asInputStream(), KoodiType[].class));
        return Arrays.asList(koodiCollectionType);
    }
}
