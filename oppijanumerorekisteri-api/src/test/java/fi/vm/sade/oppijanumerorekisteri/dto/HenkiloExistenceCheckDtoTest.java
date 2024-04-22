package fi.vm.sade.oppijanumerorekisteri.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.validation.beanvalidation.SpringValidatorAdapter;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class HenkiloExistenceCheckDtoTest {

    private static final Validator jakartaValidator = Validation.buildDefaultValidatorFactory().getValidator();
    private static final SpringValidatorAdapter validator = new SpringValidatorAdapter(jakartaValidator);

    private static Stream<Arguments> parameters() {
        return Stream.of(
                Arguments.of("Should be valid", fixture("230668-003A", "a b c", "b", "d"), true),
                Arguments.of("Requires ssn", fixture(null, "a b c", "b", "d"), false),
                Arguments.of("Validates ssn", fixture("230668-003B", "a b c", "b", "d"), false),
                Arguments.of("Requires firstName", fixture("230668-003A", null, "b", "d"), false),
                Arguments.of("Validates firstName", fixture("230668-003A", "", "b", "d"), false),
                Arguments.of("Validates firstName for leading spaces", fixture("230668-003A", " a b c", "b", "d"), false),
                Arguments.of("Validates firstName for trailing spaces", fixture("230668-003A", "a b c ", "b", "d"), false),
                Arguments.of("Requires nickName", fixture("230668-003A", "a b c", null, "d"), false),
                Arguments.of("Validates nickName", fixture("230668-003A", "a b c", "", "d"), false),
                Arguments.of("Validates nickName for leading spaces", fixture("230668-003A", "a b c", " b", "d"), false),
                Arguments.of("Validates nickName for trailing spaces", fixture("230668-003A", "a b c", "b ", "d"), false),
                Arguments.of("Check that nickName is one of the first names", fixture("230668-003A", "aa bb cc", "b", "d"), false),
                Arguments.of("Requires lastName", fixture("230668-003A", "a b c", "b", null), false),
                Arguments.of("Validates lastName", fixture("230668-003A", "a b c", "b", ""), false),
                Arguments.of("Validates lastName for leading spaces", fixture("230668-003A", "a b c", "b", " d"), false),
                Arguments.of("Validates lastName for trailing spaces", fixture("230668-003A", "a b c", "b", "d "), false),
                Arguments.of("Should be valid (special chars)", fixture("230668-003A", "X Æ A-12", "Æ", "Musk"), true),
                Arguments.of("Should be valid (case insensitive nick)", fixture("230668-003A", "a b c", "B", "d"), true),
                Arguments.of("Partial match of nickname", fixture("230668-003A", "X Æ A-12", "12", "Musk"), true),
                Arguments.of("Full match of nickname", fixture("230668-003A", "X Æ A-12", "A-12", "Musk"), true)
        );
    }

    static HenkiloExistenceCheckDto fixture(String hetu, String etunimet, String kutsumanimi, String sukunimi) {
        return HenkiloExistenceCheckDto.builder()
                .hetu(hetu)
                .etunimet(etunimet)
                .kutsumanimi(kutsumanimi)
                .sukunimi(sukunimi)
                .build();
    }

    @DisplayName("Verify validation routines")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("parameters")
    void test(String msg, HenkiloExistenceCheckDto bean, boolean expected) {
        assertThat(validator.validate(bean).isEmpty()).isEqualTo(expected);
    }
}
