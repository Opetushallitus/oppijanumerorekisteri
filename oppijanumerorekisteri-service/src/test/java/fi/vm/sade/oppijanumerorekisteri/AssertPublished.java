package fi.vm.sade.oppijanumerorekisteri;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import org.mockito.ArgumentCaptor;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

public class AssertPublished {
    public static void assertPublished(ObjectMapper objectMapper, SnsClient snsClient, int times, String... oids) {
        if (times == 0) {
            verifyNoInteractions(snsClient);
        } else {
            ArgumentCaptor<PublishRequest> argumentCaptor = ArgumentCaptor.forClass(PublishRequest.class);
            verify(snsClient, times(times)).publish(argumentCaptor.capture());
            assertThat(argumentCaptor.getAllValues())
                    .extracting(s -> objectMapper.<Map<String, String>>readValue(s.message(), new TypeReference<Map<String, String>>() {})
                            .get("oidHenkilo"))
                    .containsOnly(oids);
        }
    }
}
