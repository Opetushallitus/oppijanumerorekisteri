package fi.vm.sade.oppijanumerorekisteri.validations;

import javax.validation.Constraint;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = HenkiloConstraintValidator.class)
@Target( { ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateHenkilo {
    String message() default "invalid.hetu";
}
