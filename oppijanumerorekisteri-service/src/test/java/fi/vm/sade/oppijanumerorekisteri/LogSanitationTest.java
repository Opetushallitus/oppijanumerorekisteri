package fi.vm.sade.oppijanumerorekisteri;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.context.web.WebAppConfiguration;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Verifies that finnish ssn:s are masked in application log
 */
@WebAppConfiguration
@SpringBootTest
@ContextConfiguration(classes = {})
public class LogSanitationTest {

    private static final Logger logger = LoggerFactory.getLogger(LogSanitationTest.class);
    private final PrintStream original = System.out;
    private ByteArrayOutputStream output;
    private final TestContextManager testContextManager;

    public LogSanitationTest() throws Exception {
        this.testContextManager = new TestContextManager(getClass());
        this.testContextManager.prepareTestInstance(this);
    }

    static Stream<Arguments> parameters() {
        return Stream.of(
                Arguments.of("Passthrough when no match", "foo", "foo"),
                Arguments.of("Detects hetu when separator is '+'", "123456+7890", "123456+****"),
                Arguments.of("Detects hetu when separator is '-'", "123456-7890", "123456-****"),
                Arguments.of("Detects hetu when separator is 'A'", "123456A7890", "123456A****"),
                Arguments.of("Multiple matches (non-whitespace separator)", "123456-7890-123456-7890", "123456-****-123456-****"),
                Arguments.of("Multiple matches (whitespace separator)", "123456+7890 123456-7890", "123456+**** 123456-****"),
                Arguments.of("Rest of the line remains as is", "foo 123456+7890 bar", "foo 123456+**** bar"),
                Arguments.of("Not a hetu (birth time)", "1123456+7890", "1123456+7890"),
                Arguments.of("Not a hetu (suffix)", "123456+78900", "123456+78900"),
                Arguments.of("Hetu with separator from new spec", "123456B7890", "123456B****")
        );
    }

    @AfterEach
    public void tearDown() throws IOException {
        System.setOut(original);
        if (output != null) {
            output.close();
        }
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("parameters")
    public void sanitizeHetus(String desc, String input, String expected) {
        output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
        logger.info(input);
        assertEquals(expected, output.toString().split(":")[3].trim());
    }
}
