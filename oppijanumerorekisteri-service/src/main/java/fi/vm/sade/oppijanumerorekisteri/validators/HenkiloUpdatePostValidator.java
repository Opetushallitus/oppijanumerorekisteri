package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.Set;
import static java.util.stream.Collectors.toSet;

@Component
public class HenkiloUpdatePostValidator implements Validator {
    private UserDetailsHelper userDetailsHelper;

    private KoodistoService koodistoService;

    private HenkiloRepository henkiloRepository;


    @Autowired
    public HenkiloUpdatePostValidator(UserDetailsHelper userDetailsHelper,
                                      KoodistoService koodistoService,
                                      HenkiloRepository henkiloRepository) {
        this.userDetailsHelper = userDetailsHelper;
        this.koodistoService = koodistoService;
        this.henkiloRepository = henkiloRepository;
    }

    @Override
    public boolean supports(Class<?> aClass) {
        return HenkiloUpdateDto.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {
        HenkiloUpdateDto henkiloUpdateDto = (HenkiloUpdateDto) o;

        this.henkiloRepository.findByOidHenkilo(henkiloUpdateDto.getOidHenkilo())
                .ifPresent(henkilo -> validateHetu(henkilo, henkiloUpdateDto, errors));

        this.validateWithoutHetu(henkiloUpdateDto, errors);
    }

    public void validateWithoutHetu(Object o, Errors errors) {
        HenkiloUpdateDto dto = (HenkiloUpdateDto) o;

        validateKutsumanimi(dto, errors);

        KoodiValidator validator = new KoodiValidator(koodistoService, errors);
        validateSukupuoli(dto, validator);
        validateKansalaisuus(dto, validator);
        validateYhteystiedot(dto, validator);
    }

    private void validateKutsumanimi(HenkiloUpdateDto dto, Errors errors) {
        if(dto.getKutsumanimi() != null && dto.getEtunimet() != null) {
            KutsumanimiValidator kutsumanimiValidator = new KutsumanimiValidator(dto.getEtunimet());
            if (!kutsumanimiValidator.isValid(dto.getKutsumanimi())) {
                errors.rejectValue("kutsumanimi",
                        "kutsumanimi.must.exist.in.etunimet",
                        new Object[]{dto.getKutsumanimi(), dto.getEtunimet()},
                        "Kutsumanimen on oltava osa etunimeä");
            }
        }
    }

    private void validateSukupuoli(HenkiloUpdateDto dto, KoodiValidator validator) {
        validator.validate(Koodisto.SUKUPUOLI, dto.getSukupuoli(),
                "sukupuoli", "invalid.sukupuoli");
    }

    private void validateKansalaisuus(HenkiloUpdateDto dto, KoodiValidator validator) {
        Set<KansalaisuusDto> kansalaisuusDtoSet = dto.getKansalaisuus();
        if (kansalaisuusDtoSet != null) {
            Set<String> kansalaisuusKoodit = kansalaisuusDtoSet.stream()
                    .map(KansalaisuusDto::getKansalaisuusKoodi).collect(toSet());
            validator.validate(Koodisto.MAAT_JA_VALTIOT_2, kansalaisuusKoodit,
                    "kansalaisuus", "invalid.kansalaisuusKoodi");
        }
    }

    private void validateYhteystiedot(HenkiloUpdateDto dto, KoodiValidator validator) {
        Set<YhteystiedotRyhmaDto> yhteystiedot = dto.getYhteystiedotRyhma();
        if (yhteystiedot != null && !yhteystiedot.isEmpty()) {
            Set<String> tyypit = yhteystiedot.stream()
                    .map(YhteystiedotRyhmaDto::getRyhmaKuvaus).collect(toSet());
            validator.validate(Koodisto.YHTEYSTIETOTYYPIT, tyypit,
                    "yhteystiedotRyhma", "invalid.ryhmaKuvaus");

            Set<String> alkuperat = yhteystiedot.stream()
                    .map(YhteystiedotRyhmaDto::getRyhmaAlkuperaTieto).collect(toSet());
            validator.validate(Koodisto.YHTEYSTIETOJEN_ALKUPERA, alkuperat,
                    "yhteystiedotRyhma", "invalid.ryhmaAlkuperaTieto");
        }
    }

    private void validateHetu(Henkilo henkiloByOid, HenkiloUpdateDto dto, Errors errors) {
        if (dto.getHetu() != null && !Objects.equals(henkiloByOid.getHetu(), dto.getHetu())) {
            if (henkiloByOid.isYksiloityVTJ()) {
                // estetään hetun muuttaminen jos yksilöinti on jo tehty
                errors.rejectValue("hetu", "socialsecuritynr.already.set");
            } else if (!StringUtils.isEmpty(dto.getHetu())) {
                // tarkistetaan että hetu on uniikki
                henkiloRepository.findByHetu(dto.getHetu()).ifPresent(henkiloByHetu -> {
                    if (!henkiloByHetu.getOidHenkilo().equals(dto.getOidHenkilo())) {
                        errors.rejectValue("hetu", "socialsecuritynr.already.exists");
                    }
                });
            }
        }
    }

}
