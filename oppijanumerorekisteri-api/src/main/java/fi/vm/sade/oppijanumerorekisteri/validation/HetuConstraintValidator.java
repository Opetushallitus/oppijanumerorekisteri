package fi.vm.sade.oppijanumerorekisteri.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import static org.springframework.util.StringUtils.hasLength;

public class HetuConstraintValidator implements ConstraintValidator<ValidateHetu, String> {
    @Override
    public void initialize(ValidateHetu validateHetu) { }

    @Override
    public boolean isValid(String hetu, ConstraintValidatorContext constraintValidatorContext) {
        // Allow hetu to be null but if it is given make sure it's valid.
        return !hasLength(hetu) || HetuUtils.hetuIsValid(hetu);
    }
}
