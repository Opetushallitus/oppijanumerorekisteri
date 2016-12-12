package fi.vm.sade.oppijanumerorekisteri.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = AsiointikieliConstraintValidator.class)
@Target( { ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateAsiointikieli {
    String message() default "invalid.asiointikieli";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
