package fi.vm.sade.oppijanumerorekisteri;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.context.web.WebAppConfiguration;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Arrays;
import java.util.Collection;

import static org.junit.Assert.assertEquals;

/**
 * Verifies that finnish ssn:s are masked in application log
 * NOTE: utilizes application.yml in test resources, it's up
 * to developer to ensure that correct conversion patterns are
 * to be found from real application.yml or logback.xml.template
 */
@RunWith(Parameterized.class)
@WebAppConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ContextConfiguration(classes = {TestApplication.class})
public class LogSanitationTest {

    private static final Logger logger = LoggerFactory.getLogger(LogSanitationTest.class);
    private final PrintStream original = System.out;
    private final String desc;
    private final String input;
    private final String expected;
    private final ByteArrayOutputStream output;
    private final TestContextManager testContextManager;

    public LogSanitationTest(String desc, String input, String expected) throws Exception {
        this.desc = desc;
        this.input = input;
        this.expected = expected;
        this.testContextManager = new TestContextManager(getClass());
        this.testContextManager.prepareTestInstance(this);
        output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
    }

    @Parameterized.Parameters(name = "{0}")
    public static Collection<String[]> parameters() {
        return Arrays.asList(
                new String[]{"Passthrough when no match", "foo", "foo"},
                new String[]{"Detects hetu when separator is '+'", "123456+7890", "123456+****"},
                new String[]{"Detects hetu when separator is '-'", "123456-7890", "123456-****"},
                new String[]{"Detects hetu when separator is 'A'", "123456A7890", "123456A****"},
                new String[]{"Multiple matches (non-whitespace separator)", "123456-7890-123456-7890", "123456-****-123456-****"},
                new String[]{"Multiple matches (whitespace separator)", "123456+7890 123456-7890", "123456+**** 123456-****"},
                new String[]{"Rest of the line remains as is", "foo 123456+7890 bar", "foo 123456+**** bar"},
                new String[]{"Not a hetu (birth time)", "1123456+7890", "1123456+7890"},
                new String[]{"Not a hetu (suffix)", "123456+78900", "123456+78900"},
                new String[]{"Hetu with separator from new spec", "123456B7890", "123456B****"}
        );
    }

    @After
    public void tearDown() throws IOException {
        System.setOut(original);
        output.close();
    }

    @Test
    public void sanitizeHetus() {
        logger.info(input);
        assertEquals(expected, output.toString().split(":")[3].trim());
    }
}
