package fi.vm.sade.oppijanumerorekisteri.validation;

import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

class AsiointikieliConstraintValidator implements ConstraintValidator<ValidateAsiointikieli, KielisyysDto> {

    @Override
    public void initialize(ValidateAsiointikieli validateAsiointikieli) { }

    @Override
    public boolean isValid(KielisyysDto kielisyysDto, ConstraintValidatorContext constraintValidatorContext) {
        String pattern = "fi|sv|en";
        // Asiointikieli can be null but if it's not it has to be fi, sv or en.
        return kielisyysDto == null || kielisyysDto.getKielikoodi() == null
                || kielisyysDto.getKielikoodi().matches(pattern);
    }
}
