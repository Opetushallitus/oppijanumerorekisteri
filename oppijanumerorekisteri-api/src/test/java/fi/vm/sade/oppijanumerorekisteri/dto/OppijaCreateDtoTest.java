package fi.vm.sade.oppijanumerorekisteri.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.validation.beanvalidation.SpringValidatorAdapter;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.time.LocalDate;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Set.of;
import static org.assertj.core.api.Assertions.assertThat;

class OppijaCreateDtoTest {

    private static final Validator jakartaValidator = Validation.buildDefaultValidatorFactory().getValidator();
    private static final SpringValidatorAdapter validator = new SpringValidatorAdapter(jakartaValidator);

    private static Stream<Arguments> parameters() {
        return Stream.of(
                Arguments.of("Should be valid", (Consumer<OppijaCreateDto>) (dto) -> {
                }, of()),
                Arguments.of("Etunimet cannot be null", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setEtunimet(null);
                }, of("must not be empty")),
                Arguments.of("Etunimet cannot be \"\"", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setEtunimet("must not be empty");
                }, of()),
                Arguments.of("Kutsumanimi cannot be null", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setKutsumanimi(null);
                }, of("must not be empty")),
                Arguments.of("Kutsumanimi cannot be \"\"", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setKutsumanimi("must not be empty");
                }, of()),
                Arguments.of("Sukunimi cannot be null", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setSukunimi(null);
                }, of("must not be empty")),
                Arguments.of("Sukunimi cannot be \"\"", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setSukunimi("");
                }, of("must not be empty")),
                Arguments.of("Syntymäaika must be set", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setSyntymaaika(null);
                }, of("must not be null")),
                Arguments.of("Kansalaisuus cannot be null", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setKansalaisuus(null);
                }, of("must not be empty")),
                Arguments.of("Kansalaisuus cannot be empty", (Consumer<OppijaCreateDto>) (dto) -> {
                    dto.setKansalaisuus(of());
                }, of("must not be empty"))
        );
    }

    private static OppijaCreateDto getValid() {
        return OppijaCreateDto.builder()
                .etunimet("testi")
                .kutsumanimi("testi")
                .sukunimi("testi")
                .syntymaaika(LocalDate.EPOCH)
                .sukupuoli("1")
                .aidinkieli(KielisyysDto.builder()
                        .kieliKoodi("fi")
                        .kieliTyyppi("?")
                        .build())
                .kansalaisuus(of(
                        KansalaisuusDto.builder()
                                .kansalaisuusKoodi("FI")
                                .build()
                ))
                .build();
    }

    @DisplayName("Verify validation routines")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("parameters")
    void test(String msg, Consumer<OppijaCreateDto> mutation, Set<String> expected) {
        OppijaCreateDto dto = getValid();
        mutation.accept(dto);
        assertThat(validator.validate(dto).stream().map(ConstraintViolation::getMessage).collect(Collectors.toSet())).isEqualTo(expected);
    }
}
