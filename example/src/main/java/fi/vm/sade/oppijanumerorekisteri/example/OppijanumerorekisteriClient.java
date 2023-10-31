package fi.vm.sade.oppijanumerorekisteri.example;


import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;

public class OppijanumerorekisteriClient extends CasAuthenticatedServiceClient {
    private final Logger log = LogManager.getLogger(this.getClass());

    private final ObjectMapper mapper = JsonMapper.builder()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();

    public OppijanumerorekisteriClient(HttpClient httpClient, CasClient casClient) {
        super(httpClient, casClient, Config.virkailijaUrl + "/oppijanumerorekisteri-service");
        log.info("Creating OppijanumerorekisteriClient");
    }

    public ApiResponse yleistunnisteHae(YleistunnisteHaeRequest requestBody) throws IOException, InterruptedException {
        return post("/yleistunniste/hae", mapper.writeValueAsString(requestBody));
    }

    public ApiResponse post(String path, String requestBody) throws IOException, InterruptedException {
        log.info("Doing request to {} with body {}", path, requestBody);
        var request = HttpRequest.newBuilder()
                .uri(URI.create(serviceUrl + path))
                .method("POST", HttpRequest.BodyPublishers.ofString(requestBody))
                .header("Content-Type", "application/json");
        var response = sendRequest(request);
        return new ApiResponse(response.statusCode(), response.body());
    }

    public static class YleistunnisteHaeRequest {
        public final String etunimet;
        public final String hetu;
        public final String kutsumanimi;
        public final String sukunimi;

        public YleistunnisteHaeRequest(String etunimet, String hetu, String kutsumanimi, String sukunimi) {
            this.etunimet = etunimet;
            this.hetu = hetu;
            this.kutsumanimi = kutsumanimi;
            this.sukunimi = sukunimi;
        }
    }

    public static class ApiResponse {
        private final Integer status;
        private final String body;

        public ApiResponse(Integer status, String body) {
            this.status = status;
            this.body = body;
        }

        public String toString() {
            return "ApiResponse(status=" + status + ", body=" + body + ")";
        }
    }
}
