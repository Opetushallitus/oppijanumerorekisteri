package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import tools.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

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
    private final RetryingAnonymousOphClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${virkailija.baseurl}")
    private String virkailijaBaseUrl;

    @Override
    public boolean exists(String oid) {
        return getByOid(oid).isPresent();
    }

    @Override
    public Optional<OrganisaatioDto> getByOid(String oid) {
        try {
            String url = virkailijaBaseUrl + "/organisaatio-service/rest/organisaatio/" + oid;
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
            UriComponentsBuilder url = UriComponentsBuilder.fromUriString(virkailijaBaseUrl)
                .pathSegment("organisaatio-service", "rest", "organisaatio", oid, "childoids");
            queryParams.forEach(url::queryParam);
            var requestBuilder = HttpRequest.newBuilder()
                .uri(new URI(url.toUriString()))
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
