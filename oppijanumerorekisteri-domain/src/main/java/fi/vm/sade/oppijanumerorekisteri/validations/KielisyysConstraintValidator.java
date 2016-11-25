package fi.vm.sade.oppijanumerorekisteri.validations;

import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import org.springframework.beans.factory.annotation.Autowired;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class KielisyysConstraintValidator implements ConstraintValidator<ValidateKielisyys, Kielisyys> {
    @Autowired
    private KielisyysRepository kielisyysRepository;

    public KielisyysConstraintValidator(KielisyysRepository kielisyysRepository) {
        this.kielisyysRepository = kielisyysRepository;
    }

    @Override
    public void initialize(ValidateKielisyys validateKielisyys) {

    }

    @Override
    public boolean isValid(Kielisyys kielisyys, ConstraintValidatorContext constraintValidatorContext) {
        return kielisyys == null || this.kielisyysRepository.findByKielikoodi(kielisyys.getKielikoodi()).isPresent();
    }
}
