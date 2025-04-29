package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.skyscreamer.jsonassert.JSONAssert.assertEquals;

public class AtaruClientImplTest {

    private AtaruClientImpl client;
    @MockitoBean
    private OphHttpClient ophHttpClient;
    private ObjectMapper objectMapper;
    @MockitoBean
    private UrlConfiguration urlConfiguration;

    @Before
    public void setup() {
        objectMapper = new ObjectMapper();
        client = new AtaruClientImpl(ophHttpClient, urlConfiguration, objectMapper);
    }

    @Test
    public void fromJson() throws Exception {
        assertEquals(
                FilesystemHelper.getFixture("/clients/ataru/output.json"),
                objectMapper.writeValueAsString(client.fromJson(FilesystemHelper.getFixture("/clients/ataru/input.json"))),
                true);
    }
}
