package fi.vm.sade.oppijanumerorekisteri.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import javax.validation.Constraint;
import javax.validation.Payload;

/**
 * Validoi että ainakin yksi annetuista kentistä on syötetty (!= null).
 *
 * Esim. {@code @ValidateAtLeastOneNotNull({"kentta1", "kentta2"})}
 *
 * @see ValidateAtLeastOneNotNullValidator validaattorin toteutus
 */
@Documented
@Constraint(validatedBy = ValidateAtLeastOneNotNullValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateAtLeastOneNotNull {

    String message() default "validateatleastonenotnull";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String[] value();

}
