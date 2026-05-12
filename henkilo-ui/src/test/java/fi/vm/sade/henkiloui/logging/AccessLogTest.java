package fi.vm.sade.henkiloui.logging;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.client.TestRestTemplate;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.boot.http.client.ClientHttpRequestFactorySettings.Redirects.DONT_FOLLOW;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ExtendWith(OutputCaptureExtension.class)
public class AccessLogTest {
    @Autowired
    private TestRestTemplate restTemplate;
    private TestRestTemplate restTemplateWithoutRedirects;

    @BeforeEach
    public void setUp() {
        restTemplateWithoutRedirects = restTemplate.withRedirects(DONT_FOLLOW);
    }

    @Test
    public void requestIsLogged(CapturedOutput output) {
        getForEntity("/");
        assertEquals("GET / HTTP/1.1", resolveLog(output));
    }

    @Test
    public void sensitiveInformationInPathIsMasked(CapturedOutput output) {
        getForEntity("/123456+7890");
        assertEquals("GET /123456+**** HTTP/1.1", resolveLog(output));
    }

    @Test
    public void sensitiveInformationInPathIsMaskedNewSpec(CapturedOutput output) {
        getForEntity("/123456X7890");
        assertEquals("GET /123456X**** HTTP/1.1", resolveLog(output));
    }

    @Test
    public void sensitiveInformationInRequestParameterIsMasked(CapturedOutput output) {
        getForEntity("/?test=123456-7890");
        assertEquals("GET /?test=123456-**** HTTP/1.1", resolveLog(output));
    }

    @Test
    public void allSensitiveInformationIsMasked(CapturedOutput output) {
        getForEntity("/123456+789A/123456-789B?test=123456A7890&test=123456-789R");
        assertEquals("GET /123456+****/123456-****?test=123456A****&test=123456-**** HTTP/1.1", resolveLog(output));
    }

    @Test
    public void onlyExactMatchesAreMaskedIncorrectPrefix(CapturedOutput output) {
        getForEntity("/1234567-890A");
        assertEquals("GET /1234567-890A HTTP/1.1", resolveLog(output));
    }

    @Test
    public void onlyExactMatchesAreMaskedIncorrectSuffix(CapturedOutput output) {
        getForEntity("/123456-890AA");
        assertEquals("GET /123456-890AA HTTP/1.1", resolveLog(output));
    }

    @Test
    public void handlesOids(CapturedOutput output) {
        getForEntity("/1.2.246.562.24.43116640405");
        assertEquals("GET /1.2.246.562.24.43116640405 HTTP/1.1", resolveLog(output));
    }

    @Test
    public void hasRequestMappingField(CapturedOutput output) {
        getForEntity("/henkilo/1.2.246.562.24.43116640405");
        assertEquals("-", resolveLogLine(output).requestMapping);
    }

    private void getForEntity(String url) {
        restTemplateWithoutRedirects.getForEntity(url, String.class);
    }

    private String resolveLog(CapturedOutput output) {
        return resolveLogLine(output).request;
    }

    private AccessLogLine resolveLogLine(CapturedOutput output) {
        var lines = output.getOut().split(System.lineSeparator());
        for (int i = lines.length - 1; i >= 0; i--) {
            var s = lines[i];
            var result = tryParse(s);
            if (result != null) return result;
        }
        throw new RuntimeException("No log line found");
    }

    private AccessLogLine tryParse(String s) {
        try {
            return objectMapper.readValue(s, AccessLogLine.class);
        } catch (IOException e) {
            return null;
        }
    }

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .enable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
            .enable(DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES);

    record AccessLogLine(String request, String requestMapping, String callerHenkiloOid) {}
}
