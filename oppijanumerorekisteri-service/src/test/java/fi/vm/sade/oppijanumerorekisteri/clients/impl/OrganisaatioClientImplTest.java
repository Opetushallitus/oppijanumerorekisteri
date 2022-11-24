package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.httpclient.*;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.core.env.Environment;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Set;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class OrganisaatioClientImplTest {

    private OrganisaatioClientImpl client;

    private OphHttpResponse httpResponseMock;
    private OphHttpClientProxy httpClientProxyMock;

    @Before
    public void setup() throws IOException {
        httpResponseMock = mock(OphHttpResponse.class);
        httpClientProxyMock = mock(OphHttpClientProxy.class);
        OphHttpClientProxyRequest httpClientProxyRequestMock = mock(OphHttpClientProxyRequest.class);
        when(httpClientProxyMock.createRequest(any())).thenReturn(httpClientProxyRequestMock);
        when(httpClientProxyRequestMock.execute(any())).thenAnswer(invocation -> {
            OphHttpResponseHandler httpResponseHandler = invocation.getArgument(0);
            return httpResponseHandler.handleResponse(httpResponseMock);
        });
        when(httpClientProxyRequestMock.handleManually()).thenReturn(httpResponseMock);
        Environment environment = mock(Environment.class);
        when(environment.getRequiredProperty(any())).thenReturn("localhost");
        UrlConfiguration properties = new UrlConfiguration(environment);
        client = new OrganisaatioClientImpl(new OphHttpClient(httpClientProxyMock, "test", properties), new ObjectMapper());
    }

    private void prepareHttpResponseMock(String json) {
        prepareHttpResponseMock(200, json);
    }

    private void prepareHttpResponseMock(int statusCode, String json) {
        when(httpResponseMock.getStatusCode()).thenReturn(statusCode);
        when(httpResponseMock.getHeaderKeys()).thenReturn(singletonList("Content-Type"));
        when(httpResponseMock.getHeaderValues(eq("Content-Type"))).thenReturn(singletonList("application/json"));
        when(httpResponseMock.asInputStream()).thenReturn(new ByteArrayInputStream(json.getBytes()));
    }

    @Test
    public void getChildOids() {
        prepareHttpResponseMock("{\"oids\": [\"oid656\", \"oid956\"]}");

        Set<String> childOids = client.getChildOids("oid123", true, OrganisaatioTilat.vainAktiiviset());

        assertThat(childOids).containsExactlyInAnyOrder("oid656", "oid956");
        ArgumentCaptor<OphRequestParameters> requestParametersArgumentCaptor = ArgumentCaptor.forClass(OphRequestParameters.class);
        verify(httpClientProxyMock).createRequest(requestParametersArgumentCaptor.capture());
        OphRequestParameters requestParameters = requestParametersArgumentCaptor.getValue();
        assertThat(requestParameters.url).startsWith("https://localhost/organisaatio-service/rest/organisaatio/oid123/childoids?")
                .contains("rekursiivisesti=true")
                .contains("aktiiviset=true")
                .contains("suunnitellut=false")
                .contains("lakkautetut=false");
    }

}
