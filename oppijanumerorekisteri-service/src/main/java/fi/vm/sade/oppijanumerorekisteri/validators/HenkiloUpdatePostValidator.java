package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.Optional;
import java.util.Set;
import static java.util.stream.Collectors.toSet;

@Component
public class HenkiloUpdatePostValidator implements Validator {
    private UserDetailsHelper userDetailsHelper;

    private KoodistoService koodistoService;

    private HenkiloJpaRepository henkiloJpaRepository;

    @Autowired
    public HenkiloUpdatePostValidator(UserDetailsHelper userDetailsHelper,
                                      KoodistoService koodistoService,
                                      HenkiloJpaRepository henkiloJpaRepository) {
        this.userDetailsHelper = userDetailsHelper;
        this.koodistoService = koodistoService;
        this.henkiloJpaRepository = henkiloJpaRepository;
    }

    @Override
    public boolean supports(Class<?> aClass) {
        return HenkiloUpdateDto.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {
        HenkiloUpdateDto henkiloUpdateDto = (HenkiloUpdateDto) o;
        String kasittelijaOid = this.userDetailsHelper.getCurrentUserOid();
        if (kasittelijaOid.equals(henkiloUpdateDto.getOidHenkilo())) {
            errors.reject("cant.modify.own.data");
        }

        Optional hetu = this.henkiloJpaRepository.findHetuByOid(henkiloUpdateDto.getOidHenkilo());
        if (hetu.isPresent() && !StringUtils.isEmpty(hetu.get()) && !hetu.get().equals(henkiloUpdateDto.getHetu())) {
            errors.rejectValue("hetu", "socialsecuritynr.already.exists");
        }

        KoodiValidator koodiValidator = new KoodiValidator(koodistoService, errors);

        koodiValidator.validate(Koodisto.SUKUPUOLI, henkiloUpdateDto.getSukupuoli(),
                "sukupuoli", "invalid.sukupuoli");

        Set<KansalaisuusDto> kansalaisuusDtoSet = henkiloUpdateDto.getKansalaisuus();
        if (kansalaisuusDtoSet != null) {
            Set<String> kansalaisuusKoodit = kansalaisuusDtoSet.stream()
                    .map(KansalaisuusDto::getKansalaisuusKoodi).collect(toSet());
            koodiValidator.validate(Koodisto.MAAT_JA_VALTIOT_2, kansalaisuusKoodit,
                    "kansalaisuus", "invalid.kansalaisuusKoodi");
        }

        Set<YhteystiedotRyhmaDto> yhteystiedot = henkiloUpdateDto.getYhteystiedotRyhma();
        if (yhteystiedot != null && !yhteystiedot.isEmpty()) {
            Set<String> tyypit = yhteystiedot.stream()
                    .map(YhteystiedotRyhmaDto::getRyhmaKuvaus).collect(toSet());
            koodiValidator.validate(Koodisto.YHTEYSTIETOTYYPIT, tyypit,
                    "yhteystiedotRyhma", "invalid.ryhmaKuvaus");
            Set<String> alkuperat = yhteystiedot.stream()
                    .map(YhteystiedotRyhmaDto::getRyhmaAlkuperaTieto).collect(toSet());
            koodiValidator.validate(Koodisto.YHTEYSTIETOJEN_ALKUPERA, alkuperat,
                    "yhteystiedotRyhma", "invalid.ryhmaAlkuperaTieto");
        }
    }

}
