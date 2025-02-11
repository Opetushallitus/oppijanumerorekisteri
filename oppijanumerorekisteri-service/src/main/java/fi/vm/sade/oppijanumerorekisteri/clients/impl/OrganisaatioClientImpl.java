package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@Transactional
@RequiredArgsConstructor
public class OrganisaatioClientImpl implements OrganisaatioClient {
    private final UrlConfiguration urlConfiguration;
    private final RetryingAnonymousOphClient httpClient;
    private final ObjectMapper objectMapper;

    @Override
    public boolean exists(String oid) {
        return getByOid(oid).isPresent();
    }

    @Override
    public Optional<OrganisaatioDto> getByOid(String oid) {
        try {
            String url = urlConfiguration.url("organisaatio-service.organisaatio.byOid", oid);
            var requestBuilder = HttpRequest.newBuilder()
                .uri(new URI(url))
                .GET();
            HttpResponse<String> response = httpClient.sendRequestWithRetry(requestBuilder);
            if (response.statusCode() == HttpStatus.NOT_FOUND.value()) {
                return Optional.empty();
            }
            return Optional.of(objectMapper.readValue(response.body(), OrganisaatioDto.class));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Set<String> getChildOids(String oid, boolean rekursiivisesti, OrganisaatioTilat tilat) {
        try {
            Map<String, Boolean> queryParams = tilat.asMap();
            queryParams.put("rekursiivisesti", rekursiivisesti);
            String url = urlConfiguration.url("organisaatio-service.organisaatio.byOid.childoids", oid, queryParams);
            var requestBuilder = HttpRequest.newBuilder()
                .uri(new URI(url))
                .GET();
            HttpResponse<String> response = httpClient.sendRequestWithRetry(requestBuilder);
            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), ChildOids.class).getOids();
            } else {
                throw new RuntimeException("Unexpected response status");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Getter
    @Setter
    private static class ChildOids {
        private Set<String> oids;
    }

}
