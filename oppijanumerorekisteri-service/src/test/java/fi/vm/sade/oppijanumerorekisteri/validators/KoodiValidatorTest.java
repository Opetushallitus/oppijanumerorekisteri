package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.validation.Errors;

import java.util.Arrays;
import java.util.HashSet;

import static java.util.Arrays.asList;
import static java.util.stream.Collectors.toSet;
import static java.util.stream.Stream.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
public class KoodiValidatorTest {

    private KoodiValidator koodistoValidator;

    @Mock
    private KoodistoService koodistoService;
    @Mock
    private Errors errors;

    @Before
    public void setup() {
        koodistoValidator = new KoodiValidator(koodistoService, errors);
    }

    private KoodiType koodiType(String koodiArvo) {
        KoodiType koodiType = new KoodiType();
        koodiType.setKoodiArvo(koodiArvo);
        return koodiType;
    }

    @Test
    public void validateSingleNoError() {
        when(koodistoService.list(any())).thenReturn(
                Arrays.asList(koodiType("1"), koodiType("2")));

        koodistoValidator.validate(Koodisto.SUKUPUOLI,
                "1",
                "field", "errorCode");

        verify(koodistoService).list(eq(Koodisto.SUKUPUOLI));
        verifyNoInteractions(errors);
    }

    @Test
    public void validateSingleError() {
        when(koodistoService.list(any())).thenReturn(
                Arrays.asList(koodiType("1"), koodiType("2")));

        koodistoValidator.validate(Koodisto.SUKUPUOLI,
                "3",
                "field", "errorCode");

        verify(koodistoService).list(eq(Koodisto.SUKUPUOLI));
        ArgumentCaptor<Object[]> errorArgsCaptor = ArgumentCaptor.forClass(Object[].class);
        verify(errors).rejectValue(eq("field"), eq("errorCode"), errorArgsCaptor.capture(), any());
        Object[] errorArgs = errorArgsCaptor.getValue();
        assertThat(errorArgs).containsExactly("3");
    }

    @Test
    public void validateMultipleNoErrors() {
        when(koodistoService.list(any())).thenReturn(
                Arrays.asList(koodiType("alkupera1"), koodiType("alkupera2"), koodiType("alkupera3")));

        koodistoValidator.validate(Koodisto.YHTEYSTIETOJEN_ALKUPERA,
                of("alkupera1", "alkupera3").collect(toSet()),
                "field", "errorCode");

        verify(koodistoService).list(eq(Koodisto.YHTEYSTIETOJEN_ALKUPERA));
        verifyNoInteractions(errors);
    }

    @Test
    public void validateMultipleErrors() {
        when(koodistoService.list(any())).thenReturn(
                Arrays.asList(koodiType("alkupera1"), koodiType("alkupera2"), koodiType("alkupera3")));

        koodistoValidator.validate(Koodisto.YHTEYSTIETOJEN_ALKUPERA,
                of("alkupera0", "alkupera1", "alkupera2", "alkupera3", "alkupera4").collect(toSet()),
                "field", "errorCode");

        verify(koodistoService).list(eq(Koodisto.YHTEYSTIETOJEN_ALKUPERA));
        ArgumentCaptor<Object[]> errorArgsCaptor = ArgumentCaptor.forClass(Object[].class);
        verify(errors).rejectValue(eq("field"), eq("errorCode"), errorArgsCaptor.capture(), any());
        Object[] errorArgs = errorArgsCaptor.getValue();
        assertThat(errorArgs).containsExactly(new HashSet<>(asList("alkupera0", "alkupera4")));
    }

}
