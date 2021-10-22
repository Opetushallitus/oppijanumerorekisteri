package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.oppijanumerorekisteri.configurations.AccessLogConfiguration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;

import static org.junit.Assert.assertEquals;

/**
 * This test boots up tomcat server and tests masking of sensitive
 * information in access log produced. Behavior is same as in
 * final product, but access log format is more terse for brevity.
 *
 * check <a href="file:../resources/logback-access.xml">logback-access.xml</a>
 * in test resources to see the tested regexp.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = {OppijanumerorekisteriServiceApplication.class})
public class AccessLogTest {

    private final PrintStream restore = System.out;
    @Autowired
    private TestRestTemplate restTemplate;
    private ByteArrayOutputStream output;

    @Before
    public void setUp() {
        output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
    }

    @After
    public void tearDown() throws IOException {
        System.setOut(restore);
        output.close();
    }

    @Test
    public void requestIsLogged() {
        restTemplate.getForEntity("/", String.class);
        assertEquals("GET / HTTP/1.1", resolveLog(output));
    }

    @Test
    public void sensitiveInformationInPathIsMasked() {
        restTemplate.getForEntity("/123456+7890", String.class);
        assertEquals("GET /123456+**** HTTP/1.1", resolveLog(output));
    }

    @Test
    public void sensitiveInformationInRequestParameterIsMasked() {
        restTemplate.getForEntity("/?test=123456-7890", String.class);
        assertEquals("GET /?test=123456-**** HTTP/1.1", resolveLog(output));
    }

    @Test
    public void allSensitiveInformationIsMasked() {
        restTemplate.getForEntity("/123456+789A/123456-789B?test=123456A7890&test=123456-789R", String.class);
        assertEquals("GET /123456+****/123456-****?test=123456A****&test=123456-**** HTTP/1.1", resolveLog(output));
    }

    @Test
    public void onlyExactMatchesAreMaskedIncorrectPrefix() {
        restTemplate.getForEntity("/1234567-890A", String.class);
        assertEquals("GET /1234567-890A HTTP/1.1", resolveLog(output));
    }

    @Test
    public void onlyExactMatchesAreMaskedIncorrectSuffix() {
        restTemplate.getForEntity("/123456-890AA", String.class);
        assertEquals("GET /123456-890AA HTTP/1.1", resolveLog(output));
    }

    @Test
    public void handlesOids() {
        restTemplate.getForEntity("/1.2.246.562.24.43116640405", String.class);
        assertEquals("GET /1.2.246.562.24.43116640405 HTTP/1.1", resolveLog(output));
    }

    private String resolveLog(ByteArrayOutputStream output) {
        for (String s : output.toString().split(System.getProperty("line.separator"), 10)) {
            if (s.startsWith("GET")) {
                return s;
            }
        }
        return "FAIL";
    }
}
