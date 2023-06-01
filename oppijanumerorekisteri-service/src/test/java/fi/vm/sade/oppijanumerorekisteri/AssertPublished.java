package fi.vm.sade.oppijanumerorekisteri;

import com.amazonaws.services.sns.AmazonSNS;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mockito.ArgumentCaptor;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class AssertPublished {
    public static void assertPublished(ObjectMapper objectMapper, AmazonSNS amazonSNS, int times, String... oids) {
        if (times == 0) {
            verifyNoInteractions(amazonSNS);
        } else {
            ArgumentCaptor<String> argumentCaptor = ArgumentCaptor.forClass(String.class);
            verify(amazonSNS, times(times)).publish(anyString(), argumentCaptor.capture());
            assertThat(argumentCaptor.getAllValues())
                    .extracting(s -> objectMapper.<Map<String, String>>readValue(s, new TypeReference<Map<String, String>>() {})
                            .get("oidHenkilo"))
                    .containsOnly(oids);
        }
    }
}
