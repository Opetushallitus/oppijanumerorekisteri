package fi.vm.sade.oppijanumerorekisteri;

import ch.qos.logback.access.common.PatternLayout;
import ch.qos.logback.access.common.spi.IAccessEvent;
import ch.qos.logback.core.ContextBase;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class AccessLogTest {

    private static final Path MAIN_ACCESS_LOGBACK_XML = Path.of("src/main/resources/logback-access.xml");
    private static final Pattern REQUEST_PATTERN =
        Pattern.compile("&quot;request&quot;:\\s*&quot;([^&]|&(?!quot;))*&quot;");
    private static final String ACCESS_LOG_PATTERN = readAccessLogPattern();

    @Test
    public void requestIsLogged() {
        assertEquals("GET / HTTP/1.1", render("GET", "/", "HTTP/1.1"));
    }

    @Test
    public void sensitiveInformationInPathIsMasked() {
        assertEquals("GET /123456+**** HTTP/1.1", render("GET", "/123456+7890", "HTTP/1.1"));
    }

    @Test
    public void sensitiveInformationInPathIsMaskedNewSpec() {
        assertEquals("GET /123456X**** HTTP/1.1", render("GET", "/123456X7890", "HTTP/1.1"));
    }

    @Test
    public void sensitiveInformationInRequestParameterIsMasked() {
        assertEquals("GET /?test=123456-**** HTTP/1.1", render("GET", "/?test=123456-7890", "HTTP/1.1"));
    }

    @Test
    public void allSensitiveInformationIsMasked() {
        assertEquals(
            "GET /123456+****/123456-****?test=123456A****&test=123456-**** HTTP/1.1",
            render("GET", "/123456+789A/123456-789B?test=123456A7890&test=123456-789R", "HTTP/1.1")
        );
    }

    @Test
    public void onlyExactMatchesAreMaskedIncorrectPrefix() {
        assertEquals("GET /1234567-890A HTTP/1.1", render("GET", "/1234567-890A", "HTTP/1.1"));
    }

    @Test
    public void onlyExactMatchesAreMaskedIncorrectSuffix() {
        assertEquals("GET /123456-890AA HTTP/1.1", render("GET", "/123456-890AA", "HTTP/1.1"));
    }

    @Test
    public void handlesOids() {
        assertEquals("GET /1.2.246.562.24.43116640405 HTTP/1.1", render("GET", "/1.2.246.562.24.43116640405", "HTTP/1.1"));
    }

    private String render(String method, String requestUri, String protocol) {
        PatternLayout layout = new PatternLayout();
        layout.setContext(new ContextBase());
        layout.setPattern(ACCESS_LOG_PATTERN);
        layout.start();
        return layout.doLayout(accessEvent(method, requestUri, protocol)).stripTrailing();
    }

    private static String readAccessLogPattern() {
        try {
            String xml = Files.readString(MAIN_ACCESS_LOGBACK_XML);
            Matcher matcher = REQUEST_PATTERN.matcher(xml);
            if (!matcher.find()) {
                throw new IllegalStateException("Could not find request pattern in " + MAIN_ACCESS_LOGBACK_XML);
            }
            String entry = matcher.group();
            int start = entry.indexOf("&quot;request&quot;: &quot;") + "&quot;request&quot;: &quot;".length();
            int end = entry.lastIndexOf("&quot;");
            return entry.substring(start, end);
        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private IAccessEvent accessEvent(String method, String requestUri, String protocol) {
        String requestLine = method + " " + requestUri + " " + protocol;
        return (IAccessEvent) Proxy.newProxyInstance(
            IAccessEvent.class.getClassLoader(),
            new Class<?>[]{IAccessEvent.class},
            (proxy, invokedMethod, args) -> switch (invokedMethod.getName()) {
                case "getMethod" -> method;
                case "getRequestURI" -> requestUri;
                case "getRequestURL" -> requestLine;
                case "getProtocol" -> protocol;
                case "prepareForDeferredProcessing", "setThreadName" -> null;
                case "getElapsedTime", "getElapsedSeconds", "getContentLength", "getSequenceNumber", "getTimeStamp" -> 0L;
                case "getStatusCode", "getLocalPort" -> 0;
                case "getRequestHeaderNames" -> java.util.Collections.emptyEnumeration();
                case "getRequestHeaderMap", "getRequestParameterMap", "getResponseHeaderMap" -> java.util.Collections.emptyMap();
                case "getResponseHeaderNameList", "getCookies" -> java.util.Collections.emptyList();
                case "getRequestParameter" -> new String[0];
                default -> null;
            }
        );
    }
}
