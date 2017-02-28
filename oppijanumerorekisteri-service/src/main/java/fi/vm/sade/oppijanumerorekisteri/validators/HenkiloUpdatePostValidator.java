package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class HenkiloUpdatePostValidator implements Validator {
    private UserDetailsHelper userDetailsHelper;

    private KoodistoClient koodistoClient;

    private HenkiloJpaRepository henkiloJpaRepository;

    @Autowired
    public HenkiloUpdatePostValidator(UserDetailsHelper userDetailsHelper,
                                      KoodistoClient koodistoClient,
                                      HenkiloJpaRepository henkiloJpaRepository) {
        this.userDetailsHelper = userDetailsHelper;
        this.koodistoClient = koodistoClient;
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

        if(henkiloUpdateDto.getSukupuoli() != null &&
                this.koodistoClient.getKoodiValuesForKoodisto("sukupuoli", 1, true)
                        .stream().noneMatch(koodiArvo -> koodiArvo.equals(henkiloUpdateDto.getSukupuoli())) ) {
            errors.rejectValue("sukupuoli", "invalid.sukupuoli");
        }

        Set<KansalaisuusDto> kansalaisuusDtoSet = henkiloUpdateDto.getKansalaisuus();
        List<String> koodiTypeList = this.koodistoClient.getKoodiValuesForKoodisto("maatjavaltiot2", 1, true);
        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        if (kansalaisuusDtoSet != null && !kansalaisuusDtoSet.stream().map(KansalaisuusDto::getKansalaisuusKoodi)
                .allMatch(kansalaisuus -> koodiTypeList.stream()
                        .anyMatch(koodi -> koodi.equals(kansalaisuus)))) {
            errors.rejectValue("kansalaisuudet", "invalid.kansalaisuusKoodi");
        }

        Set<YhteystiedotRyhmaDto> yhteystiedot = henkiloUpdateDto.getYhteystiedotRyhma();
        if (yhteystiedot != null && !yhteystiedot.isEmpty()) {
            List<KoodiType> tyypit = this.koodistoClient.getKoodisForKoodisto("yhteystietotyypit", 1, true);
            if (!yhteystiedot.stream().map(YhteystiedotRyhmaDto::getRyhmaKuvaus)
                    .allMatch(ryhmaKuvaus -> tyypit.stream()
                            .anyMatch(koodi -> koodi.getKoodiArvo().equals(ryhmaKuvaus)))) {
                errors.rejectValue("yhteystiedotRyhma", "invalid.ryhmaKuvaus");
            }
            List<KoodiType> alkuperat = this.koodistoClient.getKoodisForKoodisto("yhteystietojenalkupera", 1, true);
            if (!yhteystiedot.stream().map(YhteystiedotRyhmaDto::getRyhmaAlkuperaTieto)
                    .allMatch(alkupera -> alkuperat.stream()
                            .anyMatch(koodi -> koodi.getKoodiArvo().equals(alkupera)))) {
                errors.rejectValue("yhteystiedotRyhma", "invalid.ryhmaAlkuperaTieto");
            }
        }

    }
}
