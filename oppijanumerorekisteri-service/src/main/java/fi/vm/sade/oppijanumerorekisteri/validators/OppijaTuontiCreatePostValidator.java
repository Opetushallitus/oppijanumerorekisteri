package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.dto.KoodiUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;

import java.util.Objects;
import java.util.Optional;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.toSet;

@Component
@RequiredArgsConstructor
public class OppijaTuontiCreatePostValidator {

    private final KoodistoService koodistoService;

    public void validate(OppijaTuontiCreateDto dto, Errors errors) {
        KoodiValidator koodiValidator = new KoodiValidator(koodistoService, errors);

        IntStream.range(0, dto.getHenkilot().size()).forEach(index -> {
            OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto henkilo = dto.getHenkilot().get(index).getHenkilo();
            errors.pushNestedPath(String.format("henkilot[%d].henkilo", index));

            Optional.ofNullable(henkilo.getSukupuoli())
                    .map(KoodiUpdateDto::getKoodi)
                    .filter(Objects::nonNull)
                    .ifPresent(koodi -> koodiValidator.validate(Koodisto.SUKUPUOLI, koodi,
                            "sukupuoli", "invalid.sukupuoli"));
            Optional.ofNullable(henkilo.getAidinkieli())
                    .map(KoodiUpdateDto::getKoodi)
                    .filter(Objects::nonNull)
                    .ifPresent(koodi -> koodiValidator.validate(Koodisto.KIELI, koodi,
                            "aidinkieli", "invalid.aidinkieli"));
            Optional.ofNullable(henkilo.getKansalaisuus())
                    .map(list -> list.stream()
                            .filter(Objects::nonNull)
                            .map(KoodiUpdateDto::getKoodi)
                            .filter(Objects::nonNull)
                            .collect(toSet()))
                    .ifPresent(koodit -> koodiValidator.validate(Koodisto.MAAT_JA_VALTIOT_2, koodit,
                            "kansalaisuus", "invalid.kansalaisuus"));

            errors.popNestedPath();
        });
    }

}
