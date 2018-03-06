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
import fi.vm.sade.javautils.http.OphHttpResponse;
import fi.vm.sade.properties.OphProperties;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import org.apache.http.HttpStatus;
import org.apache.http.entity.ContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

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
        OphHttpResponse httpResponse = ophHttpClient.execute(httpRequest);
        if (httpResponse.getStatusCode() != HttpStatus.SC_OK) {
            throw new RuntimeException(String.format("Käännösten lataaminen epäonnistui, lokalisointipalvelu palautti %s (%s)", httpResponse.getStatusCode(), url));
        }
        return fromJson(httpResponse, objectMapper.getTypeFactory().constructCollectionType(List.class, LokalisointiDto.class));
    }

    private <T> T fromJson(OphHttpResponse httpResponse, JavaType javaType) {
        try (InputStream inputStream = httpResponse.asInputStream()) {
            return objectMapper.readValue(inputStream, javaType);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public void update(Collection<LokalisointiDto> dto) {
        OphHttpEntity httpEntity = new OphHttpEntity.Builder()
                .content(toJson(dto))
                .contentType(ContentType.APPLICATION_JSON)
                .build();
        OphHttpRequest httpRequest = OphHttpRequest.Builder
                .post(ophProperties.url("lokalisointi.v1.update"))
                .setEntity(httpEntity)
                .build();
        OphHttpResponse httpResponse = ophHttpClient.execute(httpRequest);
        LOGGER.info("Lokalisointipalvelu palautti {}: {}", httpResponse.getStatusCode(), httpResponse.asText());
    }

    private String toJson(Object dto) {
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException ex) {
            throw new RuntimeException(ex);
        }
    }

}
