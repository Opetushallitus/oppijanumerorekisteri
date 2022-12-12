package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.dto.KoodiUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;

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
                    .ifPresent(koodi -> koodiValidator.validate(Koodisto.SUKUPUOLI, koodi,
                            "sukupuoli", "invalid.sukupuoli"));
            Optional.ofNullable(henkilo.getAidinkieli())
                    .map(KoodiUpdateDto::getKoodi)
                    .ifPresent(koodi -> koodiValidator.validate(Koodisto.KIELI, koodi,
                            "aidinkieli", "invalid.aidinkieli"));
            Optional.ofNullable(henkilo.getKansalaisuus())
                    .map(list -> list.stream()
                            .map(KoodiUpdateDto::getKoodi)
                            .collect(toSet()))
                    .ifPresent(koodit -> koodiValidator.validate(Koodisto.MAAT_JA_VALTIOT_2, koodit,
                            "kansalaisuus", "invalid.kansalaisuus"));

            Optional.ofNullable(henkilo.getKansalaisuus())
                    .map(list -> list.stream()
                            .map(KoodiUpdateDto::getKoodi)
                            .anyMatch(Kansalaisuus.SUOMI::equals))
                    .ifPresent(isFinnish -> {
                        if (Boolean.TRUE.equals(isFinnish) && henkilo.getHetu() == null) {
                            errors.rejectValue("hetu", "hetu.required.for.finnish");
                        }
                    });

            errors.popNestedPath();
        });
    }

}
