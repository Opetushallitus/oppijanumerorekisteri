package fi.vm.sade.oppijanumerorekisteri.validations;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class HenkiloConstraintValidator implements ConstraintValidator<ValidateHenkilo, Henkilo> {


    @Override
    public void initialize(ValidateHenkilo validateHenkilo) {

    }

    @Override
    public boolean isValid(Henkilo henkilo, ConstraintValidatorContext constraintValidatorContext) {
        if (!henkilo.getKasittelijaOid().equals(henkilo.getOidhenkilo())) {
//            errors.reject("cant.modify.own.data");
            return false;
        }

        return true;
    }
}
