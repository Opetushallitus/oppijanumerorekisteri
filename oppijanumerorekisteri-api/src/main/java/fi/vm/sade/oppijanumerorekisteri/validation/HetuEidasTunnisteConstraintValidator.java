package fi.vm.sade.oppijanumerorekisteri.validation;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoCreateDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class HetuEidasTunnisteConstraintValidator implements ConstraintValidator<ValidateHenkiloPerustietoCreateDto, HenkiloPerustietoCreateDto> {
    @Override
    public void initialize(ValidateHenkiloPerustietoCreateDto validateHetu) {}

    @Override
    public boolean isValid(HenkiloPerustietoCreateDto dto, ConstraintValidatorContext context) {
        boolean isValid = !(dto.getHetu() != null && dto.getEidasTunniste() != null);
        if (!isValid) {
            context
                .buildConstraintViolationWithTemplate("Cannot findOrCreate henkilo with both hetu and eidasTunniste")
                .addConstraintViolation();
        }

        return isValid;
    }
}
