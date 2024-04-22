package fi.vm.sade.oppijanumerorekisteri.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.validation.beanvalidation.SpringValidatorAdapter;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class OppijaTuontiCreateDtoTest {

    private static final Validator jakartaValidator = Validation.buildDefaultValidatorFactory().getValidator();
    private static final SpringValidatorAdapter validator = new SpringValidatorAdapter(jakartaValidator);

    private static Stream<Arguments> parameters() {
        return Stream.of(
                Arguments.of("Should be valid", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                }, Set.of()),
                Arguments.of("Notification email may be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.setSahkoposti(null), Set.of()),
                Arguments.of("Notification email may not be empty", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.setSahkoposti(""), Set.of("size must be between 1 and 2147483647")),
                Arguments.of("Notification email is validated", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.setSahkoposti("makkara"), Set.of("must be a well-formed email address")),
                Arguments.of("Henkilot cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.setHenkilot(null), Set.of("must not be empty")),
                Arguments.of("Henkilot cannot be empty", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.setHenkilot(List.of()), Set.of("must not be empty")),
                Arguments.of("Kansalaisuus collection cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setKansalaisuus(null), Set.of("must not be empty")),
                Arguments.of("Kansalaisuus collection cannot be empty", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setKansalaisuus(List.of()), Set.of("must not be empty")),
                Arguments.of("Kansalaisuus collection cannot contain null as only element", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setKansalaisuus(Collections.singletonList(null)), Set.of("must not be null")),
                Arguments.of("Kansalaisuus collection cannot contain null:s", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setKansalaisuus(Arrays.asList(new KoodiUpdateDto("foo"), null)), Set.of("must not be null")),
                Arguments.of("Kansalaisuus koodi cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setKansalaisuus(List.of(new KoodiUpdateDto())), Set.of("must not be null")),
                Arguments.of("Sukupuoli koodi cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setSukupuoli(new KoodiUpdateDto()), Set.of("must not be null")),
                Arguments.of("Aidinkieli koodi cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setAidinkieli(new KoodiUpdateDto()), Set.of("must not be null")),
                Arguments.of("Requires one of", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setHetu(null), Set.of("Ainakin yksi kentistä oid/hetu/passinumero/sahkoposti on annettava")),
                Arguments.of("Requires one of (oid given)", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                    dto.getHenkilot().get(0).getHenkilo().setHetu(null);
                    dto.getHenkilot().get(0).getHenkilo().setOid("oid");
                }, Set.of()),
                Arguments.of("Requires one of (reject empty oid)", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                    dto.getHenkilot().get(0).getHenkilo().setHetu(null);
                    dto.getHenkilot().get(0).getHenkilo().setOid("");
                }, Set.of("size must be between 1 and 2147483647")),
                Arguments.of("Requires one of (passinumero given)", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                    dto.getHenkilot().get(0).getHenkilo().setHetu(null);
                    dto.getHenkilot().get(0).getHenkilo().setPassinumero("passinumero");
                }, Set.of()),
                Arguments.of("Requires one of (reject empty passinumero)", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                    dto.getHenkilot().get(0).getHenkilo().setHetu(null);
                    dto.getHenkilot().get(0).getHenkilo().setPassinumero("");
                }, Set.of("size must be between 1 and 2147483647")),
                Arguments.of("Requires one of (empty string given as email)", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                    dto.getHenkilot().get(0).getHenkilo().setHetu(null);
                    dto.getHenkilot().get(0).getHenkilo().setSahkoposti("");
                }, Set.of("size must be between 1 and 2147483647")),
                Arguments.of("Requires one of (incorrect email)", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                    dto.getHenkilot().get(0).getHenkilo().setHetu(null);
                    dto.getHenkilot().get(0).getHenkilo().setSahkoposti("makkara");
                }, Set.of("must be a well-formed email address")),
                Arguments.of("Requires one of (formally correct email)", (Consumer<OppijaTuontiCreateDto>) (dto) -> {
                    dto.getHenkilot().get(0).getHenkilo().setHetu(null);
                    dto.getHenkilot().get(0).getHenkilo().setSahkoposti("test@test.test");
                }, Set.of()),
                Arguments.of("Etunimi cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setEtunimet(null), Set.of("must not be empty")),
                Arguments.of("Etunimi cannot be empty string", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setEtunimet(""), Set.of("must not be empty")),
                Arguments.of("Sukunimi cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setSukunimi(null), Set.of("must not be empty")),
                Arguments.of("Sukunimi cannot be empty string", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setSukunimi(""), Set.of("must not be empty")),
                Arguments.of("Kutsumanimi cannot be null", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setKutsumanimi(null), Set.of("must not be empty")),
                Arguments.of("Kutsumanimi cannot be empty string", (Consumer<OppijaTuontiCreateDto>) (dto) -> dto.getHenkilot().get(0).getHenkilo().setKutsumanimi(""), Set.of("must not be empty"))
        );
    }

    private static OppijaTuontiCreateDto getValid() {
        return OppijaTuontiCreateDto.builder()
                .sahkoposti("test@test.test")
                .henkilot(List.of(
                        OppijaTuontiRiviCreateDto.builder()
                                .tunniste("testi")
                                .henkilo(
                                        OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                                .hetu("030296-976T")
                                                .etunimet("testi")
                                                .kutsumanimi("testi")
                                                .sukunimi("testi")
                                                .kansalaisuus(Set.of(
                                                        new KoodiUpdateDto("kansalaisuus-koodi")
                                                ))
                                                .build()
                                )
                                .build()
                ))
                .build();
    }

    @DisplayName("Verify validation routines")
    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("parameters")
    void test(String msg, Consumer<OppijaTuontiCreateDto> mutation, Set<String> expected) {
        OppijaTuontiCreateDto dto = getValid();
        mutation.accept(dto);
        assertThat(validator.validate(dto).stream().map(ConstraintViolation::getMessage).collect(Collectors.toSet())).isEqualTo(expected);
    }
}
