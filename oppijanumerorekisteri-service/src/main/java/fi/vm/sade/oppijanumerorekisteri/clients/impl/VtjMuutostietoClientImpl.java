package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpRequest.Builder;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Component
@RequiredArgsConstructor
public class VtjMuutostietoClientImpl implements VtjMuutostietoClient {
    private final OppijanumerorekisteriProperties properties;
    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    @NoArgsConstructor
    @Setter
    @Getter
    private static class AvainResponse {
        public Long viimeisinKirjausavain;
    }

    @RequiredArgsConstructor
    @Getter
    private static class MuutostietoRequestBody {
        public final Long viimeisinKirjausavain;
        public final List<String> hetulista;
    }

    @RequiredArgsConstructor
    @Getter
    private static class PerustietoRequestBody {
        public final List<String> hetulista;
    }

    @NoArgsConstructor
    @Setter
    @Getter
    private static class PerustietoResponse {
        public List<VtjPerustieto> perustiedot;
    }


    AvainResponse parseAvainResponse(String content) {
        try {
            return objectMapper.readValue(content, new TypeReference<AvainResponse>() {
            });
        } catch (IOException ioe) {
            throw new CompletionException(ioe);
        }
    }

    VtjMuutostietoResponse parseMuutostietoResponse(String content) {
        try {
            return objectMapper.readValue(content, new TypeReference<VtjMuutostietoResponse>() {
            });
        } catch (IOException ioe) {
            throw new CompletionException(ioe);
        }
    }

    PerustietoResponse parsePerustietoResponse(String content) {
        try {
            return objectMapper.readValue(content, new TypeReference<PerustietoResponse>() {
            });
        } catch (IOException ioe) {
            throw new CompletionException(ioe);
        }
    }

    private final String getBasicAuthentication() {
        String creds = properties.getVtjMuutosrajapinta().getUsername() + ":" + properties.getVtjMuutosrajapinta().getPassword();
        return "Basic " + Base64.getEncoder().encodeToString(creds.getBytes());
    }

    private final String getPalveluvaylaHeader() {
        return properties.getVtjMuutosrajapinta().getPalveluvaylaEnv() + "/GOV/2769790-1/vtj-oph-client";
    }

    private final String getPalveluvaylaPathPrefix() {
        return properties.getVtjMuutosrajapinta().getBaseUrl() +
                "/r1/" +
                properties.getVtjMuutosrajapinta().getPalveluvaylaEnv() +
                "/GOV/0245437-2/VTJmutpa/VTJmutpa";
    }

    private HttpClient buildClient() {
        return HttpClient.newBuilder()
                .build();
    }

    private Builder httpRequestBuilder(String path) {
        return HttpRequest.newBuilder()
                .uri(URI.create(getPalveluvaylaPathPrefix() + path))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("x-authorization", getBasicAuthentication())
                .header("x-road-client", getPalveluvaylaHeader());
    }

    @Override
    public Long fetchMuutostietoKirjausavain() throws InterruptedException, ExecutionException {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        HttpRequest request = httpRequestBuilder("/api/v1/kirjausavain/" + date).build();
        AvainResponse avain = buildClient()
                .sendAsync(request, BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(this::parseAvainResponse)
                .get();
        return avain.getViimeisinKirjausavain();
    }

    @Override
    public VtjMuutostietoResponse fetchHenkiloMuutostieto(Long avain, List<String> allHetus)
            throws InterruptedException, ExecutionException, JsonProcessingException {
        MuutostietoRequestBody body = new MuutostietoRequestBody(avain, allHetus);
        HttpRequest request = httpRequestBuilder("/api/v1/muutokset")
                .POST(BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();
        return buildClient()
                .sendAsync(request, BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(this::parseMuutostietoResponse)
                .get();
    }

    @Override
    public List<VtjPerustieto> fetchHenkiloPerustieto(List<String> hetus)
            throws InterruptedException, ExecutionException, JsonProcessingException {
        PerustietoRequestBody body = new PerustietoRequestBody(hetus);
        HttpRequest request = httpRequestBuilder("/api/v1/perustiedot")
                .POST(BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();
        PerustietoResponse response = buildClient()
                .sendAsync(request, BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(this::parsePerustietoResponse)
                .get();
        return response.perustiedot;
    }
}
