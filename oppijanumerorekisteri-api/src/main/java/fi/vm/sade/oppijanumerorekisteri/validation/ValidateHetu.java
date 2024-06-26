package fi.vm.sade.oppijanumerorekisteri.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = HetuConstraintValidator.class)
@Target( { ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateHetu {
    String message() default "invalid.hetu";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
