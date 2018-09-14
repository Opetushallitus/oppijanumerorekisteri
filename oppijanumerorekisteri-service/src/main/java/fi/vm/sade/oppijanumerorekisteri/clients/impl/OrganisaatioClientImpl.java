package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.httpclient.OphHttpClient;
import fi.vm.sade.javautils.httpclient.OphHttpResponse;
import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient;
import java.util.Optional;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class OrganisaatioClientImpl implements OrganisaatioClient {

    private static final int MAX_RETRY_COUNT = 3;

    private final OphHttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Override
    public boolean exists(String oid) {
        return getByOid(oid).isPresent();
    }

    @Override
    public Optional<OrganisaatioDto> getByOid(String oid) {
        return httpClient.get("organisaatio-service.organisaatio.byOid", oid)
                .expectStatus(HttpStatus.OK.value(), HttpStatus.NOT_FOUND.value())
                .accept(OphHttpClient.JSON)
                .retryOnError(MAX_RETRY_COUNT)
                .execute((OphHttpResponse response) -> {
                    if (response.getStatusCode() == HttpStatus.NOT_FOUND.value()) {
                        return Optional.empty();
                    }
                    return Optional.of(objectMapper.readValue(response.asInputStream(), OrganisaatioDto.class));
                });
    }

    @Override
    public Set<String> getChildOids(String oid) {
        return httpClient.get("organisaatio-service.organisaatio.byOid.childoids", oid)
                .expectStatus(HttpStatus.OK.value())
                .accept(OphHttpClient.JSON)
                .retryOnError(MAX_RETRY_COUNT)
                .execute((OphHttpResponse response) -> objectMapper
                        .readerFor(new TypeReference<Set<String>>() {})
                        .readValue(response.asInputStream()));
    }

}
