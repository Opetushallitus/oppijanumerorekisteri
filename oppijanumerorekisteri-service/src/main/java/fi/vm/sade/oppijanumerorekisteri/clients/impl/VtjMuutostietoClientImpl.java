package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CompletionException;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
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
        public final String tuotekoodi = "mutpT1";
        public final List<String> hetulista;
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

    private final String getBasicAuthentication() {
        String creds = properties.getVtjMuutosrajapinta().getUsername() + ":"
                + properties.getVtjMuutosrajapinta().getPassword();
        return "Basic " + Base64.getEncoder().encodeToString(creds.getBytes());
    }

    private HttpClient buildClient() throws Exception {
        return HttpClient.newBuilder()
                .build();
    }

    @Override
    public Long fetchMuutostietoKirjausavain() throws Exception {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String uri = properties.getVtjMuutosrajapinta().getBaseUrl() + "/api/v1/kirjausavain/" + date;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uri))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", getBasicAuthentication())
                .build();
        AvainResponse avain = buildClient()
                .sendAsync(request, BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(this::parseAvainResponse)
                .get();
        return avain.getViimeisinKirjausavain();
    }

    @Override
    public VtjMuutostietoResponse fetchHenkiloMuutostieto(Long avain, List<String> allHetus) throws Exception {
        String uri = properties.getVtjMuutosrajapinta().getBaseUrl() + "/api/v1/muutokset";
        MuutostietoRequestBody body = new MuutostietoRequestBody(avain, allHetus);
        HttpRequest request = HttpRequest.newBuilder()
                .POST(BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .uri(URI.create(uri))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", getBasicAuthentication())
                .build();
        return buildClient()
                .sendAsync(request, BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(this::parseMuutostietoResponse)
                .get();
    }
}
