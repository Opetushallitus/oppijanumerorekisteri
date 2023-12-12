package fi.vm.sade.oppijanumerorekisteri.validators;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Component;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class VtjMuutostietoValidator {
    public final KoodistoService koodistoService;

    public static final String KIELIKOODI_TUNTEMATON = "99";
    public static final String KUNTAKOODI_TUNTEMATON = "999";
    public static final String KANSALAISUUSKOODI_TUNTEMATON = "998";

    public void validateAndCorrectErrors(HenkiloForceReadDto henkiloForceReadDto,
            HenkiloForceUpdateDto henkiloForceUpdateDto) {
        Stream.<Consumer<HenkiloForceUpdateDto>>of(
                updateDto -> Optional.ofNullable(updateDto.getKotikunta())
                        .ifPresent(kotikunta -> replaceIfInvalid(
                                KoodiValidator.isValid(koodistoService, Koodisto.KUNTA, kotikunta),
                                updateDto::setKotikunta,
                                kotikunta,
                                KUNTAKOODI_TUNTEMATON)),
                updateDto -> Optional.ofNullable(updateDto.getAidinkieli())
                        .ifPresent(aidinkieli -> replaceIfInvalid(
                                KoodiValidator.isValid(koodistoService, Koodisto.KIELI, aidinkieli.getKieliKoodi()),
                                aidinkieli::setKieliKoodi,
                                aidinkieli.getKieliKoodi(),
                                KIELIKOODI_TUNTEMATON)),
                updateDto -> Optional.ofNullable(updateDto.getKansalaisuus())
                        .ifPresent(kansalaisuudet -> kansalaisuudet
                                .forEach(kansalaisuusDto -> Optional.ofNullable(kansalaisuusDto.getKansalaisuusKoodi())
                                        .ifPresent(kansalaisuusKoodi -> replaceIfInvalid(
                                                KoodiValidator.isValid(koodistoService, Koodisto.MAAT_JA_VALTIOT_2,
                                                        kansalaisuusKoodi),
                                                kansalaisuusDto::setKansalaisuusKoodi,
                                                kansalaisuusKoodi,
                                                KANSALAISUUSKOODI_TUNTEMATON)))),
                updateDto -> Optional.ofNullable(henkiloForceUpdateDto.getHuoltajat())
                        .ifPresent(huoltajat -> huoltajat.forEach(this::validateAndCorrectErrors)),
                updateDto -> replaceInvalidKutsumanimi(henkiloForceReadDto, updateDto),
                this::replaceInvalidEmailWithEmptyString)
                .forEach(consumer -> consumer.accept(henkiloForceUpdateDto));
    }

    private void replaceInvalidEmailWithEmptyString(HenkiloForceUpdateDto updateDto) {
        Optional.ofNullable(updateDto.getYhteystiedotRyhma())
                .ifPresent(ryhmat -> ryhmat.forEach(ryhma -> Optional.ofNullable(ryhma.getYhteystieto())
                        .ifPresent(yhteystiedot -> yhteystiedot.forEach(yhteystieto -> {
                            boolean isEmail = YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI
                                    .equals(yhteystieto.getYhteystietoTyyppi());
                            if (isEmail
                                    && !YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI
                                            .validate(yhteystieto.getYhteystietoArvo())) {
                                yhteystieto.setYhteystietoArvo("");
                            }
                        }))));
    }

    private void replaceInvalidKutsumanimi(HenkiloForceReadDto readDto,
            HenkiloForceUpdateDto updateDto) {
        // if etunimet change but kutsumanimi is not updated
        if (updateDto.getEtunimet() != null && updateDto.getKutsumanimi() == null && readDto.getKutsumanimi() != null) {
            KutsumanimiValidator kutsumanimiValidator = new KutsumanimiValidator(updateDto.getEtunimet());
            if (!kutsumanimiValidator.isValid(readDto.getKutsumanimi())) {
                updateDto.setKutsumanimi(updateDto.getEtunimet());
            }
        }

        // if kutsumanimi changes
        if (updateDto.getKutsumanimi() != null && updateDto.getEtunimet() == null) {
            KutsumanimiValidator kutsumanimiValidator = new KutsumanimiValidator(readDto.getEtunimet());
            if (!kutsumanimiValidator.isValid(updateDto.getKutsumanimi())) {
                updateDto.setKutsumanimi(null);
            }
        }
    }

    private void validateAndCorrectErrors(HuoltajaCreateDto huoltajaCreateDto) {
        Stream.<Consumer<HuoltajaCreateDto>>of(
                updateDto -> Optional.ofNullable(updateDto.getKansalaisuusKoodi())
                        .ifPresent(kansalaisuuskoodit -> kansalaisuuskoodit
                                .forEach(kansalaisuusKoodi -> replaceIfInvalid(
                                        koodi -> KoodiValidator.isValid(koodistoService, Koodisto.MAAT_JA_VALTIOT_2,
                                                koodi),
                                        updateDto::setKansalaisuusKoodi,
                                        updateDto.getKansalaisuusKoodi(),
                                        KANSALAISUUSKOODI_TUNTEMATON))))
                .forEachOrdered(consumer -> consumer.accept(huoltajaCreateDto));
    }

    private void replaceIfInvalid(Predicate<String> isValidCheck,
            Consumer<Set<String>> setter,
            Collection<String> values,
            String defaultValue) {
        Set<String> correctedValues = values.stream()
                .map(value -> isValidCheck.test(value) ? value : defaultValue)
                .collect(Collectors.toSet());
        if (values.stream().noneMatch(isValidCheck::test)) {
            log.warn("Replacing {} containing invalid koodi values with {}", values, correctedValues);
        }
        setter.accept(correctedValues);
    }

    private void replaceIfInvalid(boolean isValid, Consumer<String> setter, String value, String defaultValue) {
        if (!isValid) {
            log.warn("Replacing invalid koodi value {} with default value {}", value, defaultValue);
            setter.accept(defaultValue);
        }
    }
}
