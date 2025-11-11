package fi.vm.sade.oppijanumerorekisteri.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Constraint(validatedBy = HetuEidasTunnisteConstraintValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateHenkiloPerustietoCreateDto {
    String message() default "invalid.perustieto";
    Class<?>[] groups() default { };
    Class<? extends Payload>[] payload() default { };
}
