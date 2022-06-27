package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.HttpConnectionException;
import fi.vm.sade.oppijanumerorekisteri.logging.LogExecutionTime;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.entity.ContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.ioExceptionToRestClientException;

@Component
@Slf4j
public class AtaruClientImpl implements AtaruClient {

    private final ObjectMapper objectMapper;
    private final UrlConfiguration urlConfiguration;
    private final AuthenticationProperties authenticationProperties;
    private final OphHttpClient ophHttpClient;

    @Autowired
    public AtaruClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                           AuthenticationProperties authenticationProperties) {
        this.authenticationProperties = authenticationProperties;
        this.objectMapper = objectMapper;
        this.urlConfiguration = urlConfiguration;
        this.ophHttpClient = createOphHttpClient();
    }

    @Override
    @LogExecutionTime
    public Map<String, List<HakemusDto>> fetchApplicationsByOid(Set<String> oids) {
        return fetchByOids(oids).stream()
                .collect(Collectors.groupingBy(
                        dto -> dto.getHakemusData().get("henkiloOid").toString()));
    }


    private List<HakemusDto> fetchByOids(Set<String> oids) {
        String url = urlConfiguration.url("ataru.applications");
        return this.ophHttpClient.<List<HakemusDto>>execute(OphHttpRequest.Builder.post(url)
                        .setEntity(new OphHttpEntity.Builder()
                                .content(ioExceptionToRestClientException(() -> objectMapper.writeValueAsString(oids)))
                                .contentType(ContentType.APPLICATION_JSON)
                                .build())
                        .build())
                .expectedStatus(200)
                .mapWith(this::fromJson)
                .orElseThrow(() -> new HttpConnectionException("Failed to fetch applications from ataru. Status code: 204 or 404."));
    }

    private List<HakemusDto> fromJson(String json) {
        try {
            return jsonToHakemusDtoList(json);
        } catch (IOException e) {
            throw new HttpConnectionException("Failed to read response from ataru", e);
        }
    }

    private List<HakemusDto> jsonToHakemusDtoList(String json) throws IOException {
        TypeReference<List<Map<String, Object>>> hakemusType = new TypeReference<>() {
        };
        return objectMapper.readValue(json, hakemusType).stream()
                .map(HakemusDto::new)
                .collect(Collectors.toList());
    }

    private OphHttpClient createOphHttpClient() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getAtaru().getUsername())
                .password(authenticationProperties.getAtaru().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("cas.service.ataru"))
                .casServiceSessionInitUrl(urlConfiguration.url("cas.service.ataru"))
                .sessionCookieName("ring-session")
                .addSpringSecSuffix(false)
                .build();

        return new OphHttpClient.Builder(ConfigEnums.CALLER_ID.value()).authenticator(authenticator).build();
    }
}
