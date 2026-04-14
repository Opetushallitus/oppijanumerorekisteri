package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.skyscreamer.jsonassert.JSONAssert.assertEquals;

@ExtendWith(MockitoExtension.class)
public class AtaruClientImplTest {

    private AtaruClientImpl client;
    @Mock
    private OphHttpClient ophHttpClient;
    private ObjectMapper objectMapper;
    @Mock
    private UrlConfiguration urlConfiguration;

    @BeforeEach
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
