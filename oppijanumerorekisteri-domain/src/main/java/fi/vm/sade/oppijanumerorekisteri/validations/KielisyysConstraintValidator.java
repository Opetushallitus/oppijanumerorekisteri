package fi.vm.sade.oppijanumerorekisteri.validations;

import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

@Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
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
