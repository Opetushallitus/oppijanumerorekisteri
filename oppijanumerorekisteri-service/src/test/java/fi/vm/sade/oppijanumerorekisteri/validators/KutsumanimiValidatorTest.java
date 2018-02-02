package fi.vm.sade.oppijanumerorekisteri.validators;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.Test;

public class KutsumanimiValidatorTest {

    @Test
    public void testBasicCases() {
        KutsumanimiValidator validator = new KutsumanimiValidator("Anna-Liisa Milla Karoliina Anitra Kristiina");

        assertThat(validator.isValid("Anna")).isTrue();
        assertThat(validator.isValid("Liisa")).isTrue();
        assertThat(validator.isValid("Anna-Liisa")).isTrue();
        assertThat(validator.isValid("Milla")).isTrue();
        assertThat(validator.isValid("Karoliina")).isTrue();
        assertThat(validator.isValid("Anitra")).isTrue();
        assertThat(validator.isValid("Kristiina")).isTrue();

        assertThat(validator.isValid("Karo")).isFalse();
        assertThat(validator.isValid("liina")).isFalse();
        assertThat(validator.isValid("iisa")).isFalse();
        assertThat(validator.isValid("Sanna")).isFalse();
    }

    @Test
    public void testBasicCasesWithMultipleDashes() {
        KutsumanimiValidator validator = new KutsumanimiValidator("Anna Liisa Milla-Karoliina Anitra-Kristiina");

        assertThat(validator.isValid("Anna")).isTrue();
        assertThat(validator.isValid("Liisa")).isTrue();
        assertThat(validator.isValid("Milla-Karoliina")).isTrue();
        assertThat(validator.isValid("Milla")).isTrue();
        assertThat(validator.isValid("Karoliina")).isTrue();
        assertThat(validator.isValid("Anitra-Kristiina")).isTrue();
        assertThat(validator.isValid("Anitra")).isTrue();
        assertThat(validator.isValid("Kristiina")).isTrue();
    }

    @Test
    public void testMultipleNames() {
        KutsumanimiValidator validator = new KutsumanimiValidator("Anna-Liisa Milla Karoliina Anitra Kristiina");
        // Sequential pairs
        assertThat(validator.isValid("Anna Liisa")).isTrue();
        assertThat(validator.isValid("Liisa Milla")).isTrue();
        assertThat(validator.isValid("Anna-Liisa Milla")).isTrue();
        assertThat(validator.isValid("Milla Karoliina")).isTrue();
        assertThat(validator.isValid("Karoliina Anitra")).isTrue();
        assertThat(validator.isValid("Anitra Kristiina")).isTrue();

        assertThat(validator.isValid("Anna Milla")).isFalse();
        assertThat(validator.isValid("Milla Anitra")).isFalse();
        assertThat(validator.isValid("Liisa Anna")).isFalse();

        // Sequential triples
        assertThat(validator.isValid("Anna-Liisa Milla Karoliina")).isTrue();
        assertThat(validator.isValid("Liisa Milla Karoliina")).isTrue();
        assertThat(validator.isValid("Karoliina Anitra Kristiina")).isTrue();

        // Sqeuantial quadruples
        assertThat(validator.isValid("Anna-Liisa Milla Karoliina Anitra")).isTrue();
        assertThat(validator.isValid("Milla Karoliina Anitra Kristiina")).isTrue();
        assertThat(validator.isValid("Anna Liisa Milla Karoliina")).isTrue();
        assertThat(validator.isValid("Liisa Milla Karoliina Anitra")).isTrue();

        // Sqeuanetial quintuple
        assertThat(validator.isValid("Anna Liisa Milla Karoliina Anitra")).isTrue();
        assertThat(validator.isValid("Liisa Milla Karoliina Anitra Kristiina")).isTrue();

        // Sequential hextuple
        assertThat(validator.isValid("Anna Liisa Milla Karoliina Anitra Kristiina")).isTrue();
    }

    @Test
    public void testCornerCases() {
        // First etunimi contains kutsumanimi which is in two part other name
        KutsumanimiValidator validator = new KutsumanimiValidator("AnnaFIA Fia-Maarit");
        assertThat(validator.isValid("Fia")).isTrue();

        validator = new KutsumanimiValidator("Manh Man");
        assertThat(validator.isValid("Man")).isTrue();
    }

    @Test
    public void testCaseInsensitivity() {
        KutsumanimiValidator validator = new KutsumanimiValidator("Jorma teppo");
        assertThat(validator.isValid("jorma")).isTrue();
        assertThat(validator.isValid("Teppo")).isTrue();
        assertThat(validator.isValid("jorma Teppo")).isTrue();
    }
}
