package fi.vm.sade.oppijanumerorekisteri.clients;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.clients.cas.ApiResponse;
import fi.vm.sade.oppijanumerorekisteri.clients.cas.CasAuthenticatedServiceClient;
import fi.vm.sade.oppijanumerorekisteri.clients.cas.CasClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.HttpConnectionException;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class AtaruClient extends CasAuthenticatedServiceClient {
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    private static final long ATARU_API_LIMIT = 1000;

    public AtaruClient(HttpClient httpClient, CasClient casClient, String baseUrl, ObjectMapper objectMapper) {
        super(httpClient, casClient, baseUrl + "/auth/cas");
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
    }

    public Map<String, List<HakemusDto>> fetchApplicationsByOid(List<String> oids) {
        try {
            var response = post(
                    "/api/external/onr/applications",
                    objectMapper.writeValueAsString(oids.stream().limit(ATARU_API_LIMIT).collect(Collectors.toList()))
            );
            return switch (response.getStatus()) {
                case 200 -> fromJson(response.getBody());
                default -> {
                    log.warn("Failed to fetch ataru applications with status " + response.getStatus() + ": " + response.getBody());
                    throw new HttpConnectionException();
                }
            };
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }

    protected Map<String, List<HakemusDto>> fromJson(String json) throws IOException {
        return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {
                }).stream()
                .map(this::setServiceName)
                .map(HakemusDto::new)
                .collect(Collectors.groupingBy(
                        dto -> dto.getHakemusData().get("henkiloOid").toString()));
    }

    private Map<String, Object> setServiceName(Map<String, Object> hakemusData) {
        hakemusData.put("service", "ataru");
        return hakemusData;
    }

    private ApiResponse post(String path, String requestBody) throws IOException, InterruptedException {
        log.info("Doing request to {} with body {}", path, requestBody);
        var request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .method("POST", HttpRequest.BodyPublishers.ofString(requestBody))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json");
        var response = sendRequest(request);
        return new ApiResponse(response.statusCode(), response.body());
    }
}
