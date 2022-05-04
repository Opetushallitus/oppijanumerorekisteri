package fi.vm.sade.oppijanumerorekisteri.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.validation.beanvalidation.SpringValidatorAdapter;

import javax.validation.Validation;
import javax.validation.Validator;
import java.util.function.Function;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("YhteystietoDto input sanitation test")
class YhteystietoDtoTest {

    private static final Validator javaxValidator = Validation.buildDefaultValidatorFactory().getValidator();
    private static final SpringValidatorAdapter validator = new SpringValidatorAdapter(javaxValidator);

    private static Stream emailParamsProvider() {
        Function<String, YhteystietoDto> test = s -> YhteystietoDto.builder()
                .yhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI).yhteystietoArvo(s).build();
        return Stream.of(
                Arguments.of("Accept null", test.apply(null), true),
                Arguments.of("Accept empty", test.apply(""), true),
                Arguments.of("Accept valid email", test.apply("test@test.test"), true),
                Arguments.of("Accept valid email with alias", test.apply("test+test@test.test"), true),
                Arguments.of("Reject string without symbol", test.apply("test"), false),
                Arguments.of("Reject string with multiple symbols", test.apply("test@test@test.test"), false),
                Arguments.of("Reject string without domain", test.apply("test@"), false),
                Arguments.of("Reject email domain without tld", test.apply("test@test"), false),
                Arguments.of("Reject email without local part", test.apply("@test"), false),
                Arguments.of("Reject email starting with dot", test.apply("@test"), false),
                Arguments.of("Reject email with adjacent dots", test.apply("@test"), false),
                Arguments.of("Reject quoted addresses", test.apply("\"test <test@test.test>\""), false)
        );
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("emailParamsProvider")
    public void email(String description, YhteystietoDto dto, boolean expected) {
        assertThat(validator.validate(dto).isEmpty()).isEqualTo(expected);
    }
}
