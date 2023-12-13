package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
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
import software.amazon.awssdk.auth.signer.Aws4Signer;
import software.amazon.awssdk.auth.signer.params.Aws4SignerParams;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.ExecutableHttpRequest;
import software.amazon.awssdk.http.HttpExecuteRequest;
import software.amazon.awssdk.http.HttpExecuteResponse;
import software.amazon.awssdk.http.SdkHttpClient;
import software.amazon.awssdk.http.SdkHttpFullRequest;
import software.amazon.awssdk.http.SdkHttpMethod;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleCredentialsProvider;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;

@Component
public class VtjMuutostietoClientImpl implements VtjMuutostietoClient {
    private final OppijanumerorekisteriProperties properties;
    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();
    private final StsAssumeRoleCredentialsProvider credentialsProvider;

    public VtjMuutostietoClientImpl(OppijanumerorekisteriProperties properties, StsClient stsClient) {
        this.properties = properties;
        this.credentialsProvider = StsAssumeRoleCredentialsProvider.builder()
                    .stsClient(stsClient)
                    .refreshRequest(() -> AssumeRoleRequest.builder()
                            .roleArn(properties.getVtjMuutosrajapinta().getApigwRoleArn())
                            .roleSessionName("palveluvayla")
                            .build())
                    .build();
    }

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


    AvainResponse parseAvainResponse(InputStream content) {
        try {
            return objectMapper.readValue(content, new TypeReference<AvainResponse>() {
            });
        } catch (IOException ioe) {
            throw new CompletionException(ioe);
        }
    }

    VtjMuutostietoResponse parseMuutostietoResponse(InputStream content) {
        try {
            return objectMapper.readValue(content, new TypeReference<VtjMuutostietoResponse>() {
            });
        } catch (IOException ioe) {
            throw new CompletionException(ioe);
        }
    }

    PerustietoResponse parsePerustietoResponse(InputStream content) {
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

    private InputStream executeRequest(SdkHttpFullRequest request) throws IOException {
        SdkHttpClient httpClient =  ApacheHttpClient.builder().build();
        HttpExecuteRequest executeRequest = HttpExecuteRequest.builder()
                .request(request)
                .contentStreamProvider(request.contentStreamProvider().orElse(null))
                .build();
        ExecutableHttpRequest executableHttpRequest = httpClient.prepareRequest(executeRequest);
        HttpExecuteResponse res = executableHttpRequest.call();
        if (!res.httpResponse().isSuccessful()) {
            throw new RuntimeException("unsuccessful request (status " + res.httpResponse().statusCode() + ") to " + request.getUri());
        }
        return res.responseBody().orElseThrow(() -> new RuntimeException("no response body found for request " + request.getUri()));
    }

    private SdkHttpFullRequest signRequest(SdkHttpFullRequest request) {
        Aws4Signer signer = Aws4Signer.create();
        Aws4SignerParams signerParams = Aws4SignerParams.builder()
                .signingRegion(Region.EU_WEST_1)
                .awsCredentials(credentialsProvider.resolveCredentials())
                .signingName("execute-api")
                .build();
        return signer.sign(request, signerParams);
    }

    private SdkHttpFullRequest httpRequestBuilder(String path, SdkHttpMethod method, Object body) throws JsonProcessingException {
        URI uri = URI.create(getPalveluvaylaPathPrefix() + path);
        final SdkHttpFullRequest.Builder builder = SdkHttpFullRequest.builder()
                .method(method)
                .uri(uri)
                .appendHeader("Accept", "application/json")
                .appendHeader("Content-Type", "application/json")
                .appendHeader("x-authorization", getBasicAuthentication())
                .appendHeader("x-road-client", getPalveluvaylaHeader());
        if (body != null) {
            builder.contentStreamProvider(RequestBody.fromString(objectMapper.writeValueAsString(body)).contentStreamProvider());
        }

        SdkHttpFullRequest request = builder.build();
        return signRequest(request);
    }

    @Override
    public Long fetchMuutostietoKirjausavain() throws InterruptedException, ExecutionException, IOException {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        SdkHttpFullRequest request = httpRequestBuilder("/api/v1/kirjausavain/" + date, SdkHttpMethod.GET, null);
        InputStream response = executeRequest(request);
        return parseAvainResponse(response).getViimeisinKirjausavain();
    }

    @Override
    public VtjMuutostietoResponse fetchHenkiloMuutostieto(Long avain, List<String> allHetus)
            throws InterruptedException, ExecutionException, JsonProcessingException, IOException {
        MuutostietoRequestBody body = new MuutostietoRequestBody(avain, allHetus);
        SdkHttpFullRequest request = httpRequestBuilder("/api/v1/muutokset", SdkHttpMethod.POST, body);
        InputStream response = executeRequest(request);
        return parseMuutostietoResponse(response);
    }

    @Override
    public List<VtjPerustieto> fetchHenkiloPerustieto(List<String> hetus)
            throws InterruptedException, ExecutionException, JsonProcessingException, IOException {
        PerustietoRequestBody body = new PerustietoRequestBody(hetus);
        SdkHttpFullRequest request = httpRequestBuilder("/api/v1/perustiedot", SdkHttpMethod.POST, body);
        InputStream response = executeRequest(request);
        return parsePerustietoResponse(response).perustiedot;
    }
}
