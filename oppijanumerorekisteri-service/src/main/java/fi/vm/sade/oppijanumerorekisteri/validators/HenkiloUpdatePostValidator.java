package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UserHasNoOidException;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.List;
import java.util.Set;

@Component
public class HenkiloUpdatePostValidator implements Validator {
    private UserDetailsHelper userDetailsHelper;

    private HenkiloJpaRepository henkiloJpaRepository;
    private KielisyysRepository kielisyysRepository;

    private KoodistoClient koodistoClient;

    @Autowired
    public HenkiloUpdatePostValidator(UserDetailsHelper userDetailsHelper,
                                      HenkiloJpaRepository henkiloJpaRepository,
                                      KoodistoClient koodistoClient,
                                      KielisyysRepository kielisyysRepository) {
        this.userDetailsHelper = userDetailsHelper;
        this.henkiloJpaRepository = henkiloJpaRepository;
        this.koodistoClient = koodistoClient;
        this.kielisyysRepository = kielisyysRepository;
    }

    @Override
    public boolean supports(Class<?> aClass) {
        return HenkiloUpdateDto.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {
        HenkiloDto henkiloDto = (HenkiloDto) o;
        String kasittelijaOid = userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new);
        if(kasittelijaOid.equals(henkiloDto.getOidhenkilo())) {
            errors.reject("cant.modify.own.data");
        }

        if(henkiloJpaRepository.findOidByHetu(henkiloDto.getHetu()).isPresent()) {
            errors.rejectValue("hetu", "socialsecuritynr.already.exists");
        }

        if(!HetuUtils.hetuIsValid(henkiloDto.getHetu())) {
            errors.rejectValue("hetu", "security.number.format.illegal");
        }

        Set<KansalaisuusDto> kansalaisuusDtoSet = henkiloDto.getKansalaisuus();
        List<KoodiType> koodiTypeList = koodistoClient.getKoodisForKoodisto("maatjavaltiot2", 1, true);

        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        if(kansalaisuusDtoSet != null && !kansalaisuusDtoSet.stream().map(KansalaisuusDto::getKansalaisuuskoodi)
                .allMatch(kansalaisuus -> koodiTypeList.stream()
                        .anyMatch(koodi -> koodi.getKoodiArvo().equals(kansalaisuus)))) {
            errors.rejectValue("", "invalid.kansalaisuuskoodi");
        }

    }
}
