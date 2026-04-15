package fi.vm.sade.oppijanumerorekisteri.clients;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class HakuappClient extends CasAuthenticatedServiceClient {
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public HakuappClient(HttpClient httpClient, CasClient casClient, String baseUrl, ObjectMapper objectMapper) {
        super(httpClient, casClient, baseUrl);
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
    }

    public Map<String, List<HakemusDto>> fetchApplicationsByOid(List<String> oids) {
        try {
            var response = post("/applications/byPersonOid", objectMapper.writeValueAsString(oids));
            Map<String, List<Map<String, Object>>> applicationsByPersonOid = switch (response.getStatus()) {
                case 200 -> objectMapper.readValue(response.getBody(), new TypeReference<Map<String, List<Map<String, Object>>>>() {});
                default -> {
                    log.warn("Failed to fetch haku-app applications with status " + response.getStatus() + ": " + response.getBody());
                    throw new HttpConnectionException();
                }
            };
            Map<String, List<HakemusDto>> hakemuksetByHenkiloOid = new HashMap<>();
            applicationsByPersonOid.keySet().forEach(henkiloOid -> {
                List<Map<String, Object>> hakemukset = applicationsByPersonOid.get(henkiloOid);
                List<HakemusDto> hakemusList = hakemukset.stream().map(hakemusData -> {
                    hakemusData.put("service", "haku-app");
                    return new HakemusDto(hakemusData);
                }).collect(Collectors.toList());

                hakemuksetByHenkiloOid.put(henkiloOid, hakemusList);
            });
            return hakemuksetByHenkiloOid;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
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
