package fi.vm.sade.oppijanumerorekisteri.clients;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.skyscreamer.jsonassert.JSONAssert.assertEquals;

@SpringBootTest
public class AtaruClientTest {
    @Autowired
    private AtaruClient client;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void fromJson() throws Exception {
        assertEquals(
                FilesystemHelper.getFixture("/clients/ataru/output.json"),
                objectMapper.writeValueAsString(client.fromJson(FilesystemHelper.getFixture("/clients/ataru/input.json"))),
                true);
    }
}
