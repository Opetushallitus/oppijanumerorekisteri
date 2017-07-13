package fi.vm.sade.oppijanumerorekisteri.validators;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.Test;

public class KutsumanimiValidatorTest {

    @Test
    public void testIsValid() {
        KutsumanimiValidator validator = new KutsumanimiValidator("Anna-Liisa Milla Karoliina");

        assertThat(validator.isValid("Anna")).isTrue();
        assertThat(validator.isValid("Liisa")).isTrue();
        assertThat(validator.isValid("Anna-Liisa")).isTrue();
        assertThat(validator.isValid("Milla")).isTrue();
        assertThat(validator.isValid("Karoliina")).isTrue();
        assertThat(validator.isValid("Milla Karoliina")).isTrue();

        assertThat(validator.isValid("Karo")).isFalse();
        assertThat(validator.isValid("liina")).isFalse();
        assertThat(validator.isValid("iisa")).isFalse();
        assertThat(validator.isValid("Sanna")).isFalse();

        validator = new KutsumanimiValidator("Manh Man");
        assertThat(validator.isValid("Man")).isTrue();

        validator = new KutsumanimiValidator("Jorma teppo");
        assertThat(validator.isValid("jorma")).isTrue();
        assertThat(validator.isValid("Teppo")).isTrue();

    }

}
