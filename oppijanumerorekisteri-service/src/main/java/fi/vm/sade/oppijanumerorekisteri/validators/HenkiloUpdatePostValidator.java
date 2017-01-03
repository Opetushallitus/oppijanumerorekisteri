package fi.vm.sade.oppijanumerorekisteri.validators;

import com.querydsl.core.types.Predicate;
import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UserHasNoOidException;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.List;
import java.util.Set;

@Component
public class HenkiloUpdatePostValidator implements Validator {
    private UserDetailsHelper userDetailsHelper;

    private KoodistoClient koodistoClient;

    private HenkiloRepository henkiloRepository;

    @Autowired
    public HenkiloUpdatePostValidator(UserDetailsHelper userDetailsHelper,
                                      KoodistoClient koodistoClient,
                                      HenkiloRepository henkiloRepository) {
        this.userDetailsHelper = userDetailsHelper;
        this.koodistoClient = koodistoClient;
        this.henkiloRepository = henkiloRepository;
    }

    @Override
    public boolean supports(Class<?> aClass) {
        return HenkiloUpdateDto.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {
        HenkiloUpdateDto henkiloDto = (HenkiloUpdateDto) o;
        String kasittelijaOid = userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new);
        if (kasittelijaOid.equals(henkiloDto.getOidHenkilo())) {
            errors.reject("cant.modify.own.data");
        }

        if (!StringUtils.isEmpty(henkiloDto.getHetu())) {
            Predicate hetuExists = QHenkilo.henkilo.hetu.eq(henkiloDto.getHetu());
            if(this.henkiloRepository.exists(hetuExists)) {
                errors.rejectValue("hetu", "socialsecuritynr.already.exists");
            }
        }

        Set<KansalaisuusDto> kansalaisuusDtoSet = henkiloDto.getKansalaisuus();
        List<KoodiType> koodiTypeList = koodistoClient.getKoodisForKoodisto("maatjavaltiot2", 1, true);

        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        if (kansalaisuusDtoSet != null && !kansalaisuusDtoSet.stream().map(KansalaisuusDto::getKansalaisuusKoodi)
                .allMatch(kansalaisuus -> koodiTypeList.stream()
                        .anyMatch(koodi -> koodi.getKoodiArvo().equals(kansalaisuus)))) {
            errors.rejectValue("kansalaisuudet", "invalid.kansalaisuusKoodi");
        }

    }
}
