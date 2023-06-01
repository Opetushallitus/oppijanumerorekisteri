package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.junit.Before;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.skyscreamer.jsonassert.JSONAssert.assertEquals;

public class AtaruClientImplTest {

    private AtaruClientImpl client;
    @MockBean
    private OphHttpClient ophHttpClient;
    private ObjectMapper objectMapper;
    @MockBean
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
