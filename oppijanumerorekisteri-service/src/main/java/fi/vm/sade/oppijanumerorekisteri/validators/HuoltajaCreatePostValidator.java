package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

@Component
@RequiredArgsConstructor
public class HuoltajaCreatePostValidator implements Validator {
    private final KoodistoService koodistoService;

    @Override
    public boolean supports(@NotNull Class<?> aClass) {
        return HuoltajaCreateDto.class.equals(aClass);
    }

    @Override
    public void validate(Object o, @NotNull Errors errors) {
        HuoltajaCreateDto henkilo = (HuoltajaCreateDto) o;
        KoodiValidator koodiValidator = new KoodiValidator(koodistoService, errors);

        koodiValidator.validate(Koodisto.MAAT_JA_VALTIOT_2,
                henkilo.getKansalaisuusKoodi(),
                "kansalaisuusKoodi",
                "invalid.kansalaisuusKoodi");
    }
}
