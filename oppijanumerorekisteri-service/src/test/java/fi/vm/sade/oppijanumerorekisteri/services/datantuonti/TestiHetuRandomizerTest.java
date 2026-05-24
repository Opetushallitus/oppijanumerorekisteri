package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TestiHetuRandomizerTest {

  private final TestiHetuRandomizer randomizer = new TestiHetuRandomizer();
  private final SecureRandom random = new SecureRandom();

  @ParameterizedTest
  @ValueSource(
      strings = {
        "1800-01-01",
        "1899-12-31",
        "1900-06-15",
        "1950-03-10",
        "1999-11-30",
        "2000-01-01",
        "2024-02-29",
        "2050-07-04",
        "2099-12-31",
      })
  void generatedHetuValidatesAndRoundTripsToInputDate(String dateIso) {
    LocalDate syntymaaika = LocalDate.parse(dateIso);
    for (int i = 0; i < 50; i++) {
      String hetu = randomizer.generateTestiHetu(random, syntymaaika);
      assertThat(hetu).as("hetu length").hasSize(11);
      assertThat(HetuUtils.hetuIsValid(hetu)).as("hetu valid: %s", hetu).isTrue();
      assertThat(HetuUtils.dateFromHetu(hetu))
          .as("date round-trips through hetu: %s", hetu)
          .isEqualTo(syntymaaika);
    }
  }

  @Test
  void loppuosaIsAlwaysInTestSpace() {
    LocalDate date = LocalDate.of(2010, 5, 5);
    for (int i = 0; i < 200; i++) {
      String hetu = randomizer.generateTestiHetu(random, date);
      assertThat(hetu.charAt(7))
          .as("loppuosa first digit must be 9 (test space): %s", hetu)
          .isEqualTo('9');
    }
  }

  @ParameterizedTest
  @CsvSource({
    "1899, +",
    "1900, -YXWVU",
    "1950, -YXWVU",
    "1999, -YXWVU",
    "2000, ABCDEF",
    "2050, ABCDEF",
    "2099, ABCDEF",
  })
  void separatorComesFromCenturyAlphabet(int year, String allowedSeparators) {
    LocalDate date = LocalDate.of(year, 6, 15);
    for (int i = 0; i < 50; i++) {
      String hetu = randomizer.generateTestiHetu(random, date);
      char sep = hetu.charAt(6);
      assertThat(allowedSeparators)
          .as("separator '%s' must be from '%s' for year %d", sep, allowedSeparators, year)
          .contains(String.valueOf(sep));
    }
  }

  @Test
  void multipleSeparatorsAreReachableWithinACentury() {
    LocalDate date = LocalDate.of(1950, 6, 15);
    Set<Character> seen = new HashSet<>();
    for (int i = 0; i < 200; i++) {
      seen.add(randomizer.generateTestiHetu(random, date).charAt(6));
    }
    assertThat(seen)
        .as("1900s separators reached across draws")
        .hasSizeGreaterThan(1)
        .allSatisfy(c -> assertThat("-YXWVU").contains(String.valueOf(c)));
  }

  @Test
  void sukupuoliVariesAcrossRuns() {
    LocalDate date = LocalDate.of(2010, 1, 1);
    boolean sawMale = false;
    boolean sawFemale = false;
    for (int i = 0; i < 500 && !(sawMale && sawFemale); i++) {
      String hetu = randomizer.generateTestiHetu(random, date);
      String sukupuoli = HetuUtils.sukupuoliFromHetu(hetu);
      if ("1".equals(sukupuoli)) sawMale = true;
      if ("2".equals(sukupuoli)) sawFemale = true;
    }
    assertThat(sawMale).isTrue();
    assertThat(sawFemale).isTrue();
  }

  @ParameterizedTest
  @ValueSource(ints = {1700, 1799, 2100, 2200})
  void birthYearOutsideSupportedCenturiesThrows(int year) {
    LocalDate date = LocalDate.of(year, 6, 15);
    assertThatThrownBy(() -> randomizer.generateTestiHetu(random, date))
        .isInstanceOf(NullPointerException.class);
  }
}
