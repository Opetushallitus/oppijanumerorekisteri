package fi.vm.sade.oppijanumerorekisteri.validation;

import org.springframework.util.StringUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class HetuConstraintValidator implements ConstraintValidator<ValidateHetu, String> {
    @Override
    public void initialize(ValidateHetu validateHetu) { }

    @Override
    public boolean isValid(String hetu, ConstraintValidatorContext constraintValidatorContext) {
        // Allow hetu to be null but if it is given make sure it's valid.
        return StringUtils.isEmpty(hetu) || HetuUtils.hetuIsValid(hetu);
    }
}
