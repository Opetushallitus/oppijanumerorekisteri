package fi.vm.sade.oppijanumerorekisteri.validation;

import java.beans.IntrospectionException;
import java.beans.PropertyDescriptor;
import java.lang.reflect.InvocationTargetException;
import java.util.Objects;
import static java.util.stream.Collectors.joining;
import java.util.stream.Stream;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

/**
 * Validoi että ainakin yksi annetuista kentistä on syötetty (!= null).
 *
 * @see ValidateAtLeastOneNotNull annotaatio jolla validaattorin saa käyttöön
 */
public class ValidateAtLeastOneNotNullValidator implements ConstraintValidator<ValidateAtLeastOneNotNull, Object> {

    private String[] fieldNames;

    @Override
    public void initialize(ValidateAtLeastOneNotNull constraintAnnotation) {
        fieldNames = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null || fieldNames.length == 0) {
            return true;
        }

        boolean valid = Stream.of(fieldNames)
                .map(fieldName -> getValue(value.getClass(), value, fieldName))
                .filter(Objects::nonNull)
                .count() > 0;

        if (!valid) {
            String fieldNamesAsString = Stream.of(fieldNames).collect(joining("/"));
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(String.format("Ainakin yksi kentistä %s on annettava", fieldNamesAsString))
                    .addConstraintViolation();
        }

        return valid;
    }

    private Object getValue(Class<?> classType, Object value, String fieldName) {
        try {
            return new PropertyDescriptor(fieldName, classType).getReadMethod().invoke(value);
        } catch (IntrospectionException | IllegalAccessException | IllegalArgumentException | InvocationTargetException ex) {
            throw new IllegalArgumentException(ex);
        }
    }

}
