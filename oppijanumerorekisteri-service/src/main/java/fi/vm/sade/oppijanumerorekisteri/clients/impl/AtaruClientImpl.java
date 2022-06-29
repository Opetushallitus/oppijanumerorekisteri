package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.HttpConnectionException;
import fi.vm.sade.oppijanumerorekisteri.logging.LogExecutionTime;
import lombok.RequiredArgsConstructor;
import org.apache.http.entity.ContentType;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.ioExceptionToRestClientException;

@Component
@RequiredArgsConstructor
public class AtaruClientImpl implements AtaruClient {

    private static final long ATARU_REQUEST_LIMIT = 1000;

    @Qualifier("ataruClient")
    private final OphHttpClient ophHttpClient;
    private final UrlConfiguration urlConfiguration;
    private final ObjectMapper objectMapper;

    @Override
    @LogExecutionTime
    public Map<String, List<HakemusDto>> fetchApplicationsByOid(List<String> oids) {
        return this.ophHttpClient.<Map<String, List<HakemusDto>>>execute(OphHttpRequest.Builder
                        .post(urlConfiguration.url("ataru.applications"))
                        .setEntity(new OphHttpEntity.Builder()
                                .content(ioExceptionToRestClientException(() ->
                                        objectMapper.writeValueAsString(
                                                oids.stream()
                                                        .limit(ATARU_REQUEST_LIMIT)
                                                        .collect(Collectors.toList()))))
                                .contentType(ContentType.APPLICATION_JSON)
                                .build())
                        .build())
                .expectedStatus(200)
                .mapWith(json -> ioExceptionToRestClientException(() -> this.fromJson(json)))
                .orElseThrow(HttpConnectionException::new);
    }

    protected Map<String, List<HakemusDto>> fromJson(String json) throws IOException {
        return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {
                }).stream()
                .map(HakemusDto::new)
                .collect(Collectors.groupingBy(
                        dto -> dto.getHakemusData().get("henkiloOid").toString()));
    }
}
