package fi.vm.sade.oppijanumerorekisteri.validations;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = KielisyysConstraintValidator.class)
@Target( { ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateKielisyys {
    String message() default "message";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
