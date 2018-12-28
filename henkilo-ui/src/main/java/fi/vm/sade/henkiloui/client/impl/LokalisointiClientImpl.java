package fi.vm.sade.henkiloui.client.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.henkiloui.client.LokalisointiClient;
import fi.vm.sade.henkiloui.dto.LokalisointiCriteria;
import fi.vm.sade.henkiloui.dto.LokalisointiDto;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.properties.OphProperties;
import org.apache.http.entity.ContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import static java.util.function.Function.identity;

@Component
public class LokalisointiClientImpl implements LokalisointiClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(LokalisointiClientImpl.class);

    private final OphHttpClient ophHttpClient;
    private final OphProperties ophProperties;
    private final ObjectMapper objectMapper;

    public LokalisointiClientImpl(
            @Qualifier("lokalisointi") OphHttpClient ophHttpClient,
            OphProperties ophProperties,
            ObjectMapper objectMapper) {
        this.ophHttpClient = ophHttpClient;
        this.ophProperties = ophProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    public Collection<LokalisointiDto> list(LokalisointiCriteria criteria) {
        String url = ophProperties.url("lokalisointi.v1.list", criteria.asMap());
        OphHttpRequest httpRequest = OphHttpRequest.Builder
                .get(url)
                .build();
        return ophHttpClient.<Collection<LokalisointiDto>>execute(httpRequest)
                .expectedStatus(200)
                .mapWith(json -> fromJson(json, objectMapper.getTypeFactory().constructCollectionType(List.class, LokalisointiDto.class)))
                .orElseThrow(() -> new RuntimeException(String.format("Käännösten lataaminen epäonnistui, lokalisointipalvelu palautti 204 tai 404 (%s)", url)));
    }

    private <T> T fromJson(String json, JavaType javaType) {
        try {
            return objectMapper.readValue(json, javaType);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public void update(Collection<LokalisointiDto> dto) {
        String url = ophProperties.url("lokalisointi.v1.update");
        OphHttpEntity httpEntity = new OphHttpEntity.Builder()
                .content(toJson(dto))
                .contentType(ContentType.APPLICATION_JSON)
                .build();
        OphHttpRequest httpRequest = OphHttpRequest.Builder
                .post(url)
                .setEntity(httpEntity)
                .build();
        String json = ophHttpClient.<String>execute(httpRequest)
                .expectedStatus(200)
                .mapWith(identity())
                .orElseThrow(() -> new RuntimeException(String.format("Käännösten tallentaminen epäonnistui, lokalisointipalvelu palautti 204 tai 404 (%s)", url)));
        LOGGER.info("Lokalisointipalvelu palautti: {}", json);
    }

    private String toJson(Object dto) {
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException ex) {
            throw new RuntimeException(ex);
        }
    }

}
