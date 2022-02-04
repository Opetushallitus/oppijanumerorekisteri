package fi.vm.sade.oppijanumerorekisteri.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.validation.beanvalidation.SpringValidatorAdapter;

import javax.validation.Validation;
import javax.validation.Validator;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class HenkiloExistenceCheckDtoTest {

    private static final Validator javaxValidator = Validation.buildDefaultValidatorFactory().getValidator();
    private static final SpringValidatorAdapter validator = new SpringValidatorAdapter(javaxValidator);

    private static Stream<Arguments> parameters() {
        return Stream.of(
                Arguments.of("Should be valid", new HenkiloExistenceCheckDto("230668-003A", "a b c", "b", "d"), true),
                Arguments.of("Requires ssn", new HenkiloExistenceCheckDto(null, "a b c", "b", "d"), false),
                Arguments.of("Validates ssn", new HenkiloExistenceCheckDto("230668-003B", "a b c", "b", "d"), false),
                Arguments.of("Requires firstName", new HenkiloExistenceCheckDto("230668-003A", null, "b", "d"), false),
                Arguments.of("Validates firstName", new HenkiloExistenceCheckDto("230668-003A", "", "b", "d"), false),
                Arguments.of("Validates firstName for leading spaces", new HenkiloExistenceCheckDto("230668-003A", " a b c", "b", "d"), false),
                Arguments.of("Validates firstName for trailing spaces", new HenkiloExistenceCheckDto("230668-003A", "a b c ", "b", "d"), false),
                Arguments.of("Requires nickName", new HenkiloExistenceCheckDto("230668-003A", "a b c", null, "d"), false),
                Arguments.of("Validates nickName", new HenkiloExistenceCheckDto("230668-003A", "a b c", "", "d"), false),
                Arguments.of("Validates nickName for leading spaces", new HenkiloExistenceCheckDto("230668-003A", "a b c", " b", "d"), false),
                Arguments.of("Validates nickName for trailing spaces", new HenkiloExistenceCheckDto("230668-003A", "a b c", "b ", "d"), false),
                Arguments.of("Check that nickName is one of the first names", new HenkiloExistenceCheckDto("230668-003A", "aa bb cc", "b", "d"), false),
                Arguments.of("Requires lastName", new HenkiloExistenceCheckDto("230668-003A", "a b c", "b", null), false),
                Arguments.of("Validates lastName", new HenkiloExistenceCheckDto("230668-003A", "a b c", "b", ""), false),
                Arguments.of("Validates lastName for leading spaces", new HenkiloExistenceCheckDto("230668-003A", "a b c", "b", " d"), false),
                Arguments.of("Validates lastName for trailing spaces", new HenkiloExistenceCheckDto("230668-003A", "a b c", "b", "d "), false),
                Arguments.of("Should be valid (special chars)", new HenkiloExistenceCheckDto("230668-003A", "X Æ A-12", "Æ", "Musk"), true)
        );
    }

    @DisplayName("Verify validation routines")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("parameters")
    void test(String msg, HenkiloExistenceCheckDto bean, boolean expected) {
        assertThat(validator.validate(bean).isEmpty()).isEqualTo(expected);
    }
}
