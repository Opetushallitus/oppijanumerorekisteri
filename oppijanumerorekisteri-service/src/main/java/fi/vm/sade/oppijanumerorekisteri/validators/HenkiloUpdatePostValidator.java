package fi.vm.sade.oppijanumerorekisteri.validators;

import com.querydsl.core.types.Predicate;
import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UserHasNoOidException;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
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
        HenkiloUpdateDto henkiloDto = (HenkiloUpdateDto) o;
        String kasittelijaOid = userDetailsHelper.getCurrentUserOid()
                .orElseThrow(UserHasNoOidException::new);
        if (kasittelijaOid.equals(henkiloDto.getOidHenkilo())) {
            errors.reject("cant.modify.own.data");
        }

        Optional hetu = this.henkiloJpaRepository.findHetuByOid(henkiloDto.getOidHenkilo());
        if (hetu.isPresent() && !StringUtils.isEmpty(hetu.get()) && !hetu.get().equals(henkiloDto.getHetu())) {
            errors.rejectValue("hetu", "socialsecuritynr.already.exists");
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
