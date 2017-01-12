package fi.vm.sade.oppijanumerorekisteri.validators;

import com.querydsl.core.types.Predicate;
import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class HenkiloCreatePostValidator implements Validator {
    private KoodistoClient koodistoClient;
    private HenkiloRepository henkiloRepository;

    @Autowired
    public HenkiloCreatePostValidator(KoodistoClient koodistoClient, HenkiloRepository henkiloRepository) {
        this.koodistoClient = koodistoClient;
        this.henkiloRepository = henkiloRepository;
    }

    @Override
    public boolean supports(Class<?> aClass) {
        return Henkilo.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {
        Henkilo henkilo = (Henkilo) o;

        String hetu = henkilo.getHetu();
        Predicate hetuExists = QHenkilo.henkilo.hetu.eq(hetu);
        if (!StringUtils.isEmpty(hetu) && this.henkiloRepository.exists(hetuExists)) {
            errors.rejectValue("hetu", "socialsecuritynr.already.exists");
        }

        Set<Kansalaisuus> kansalaisuusSet = henkilo.getKansalaisuus();
        List<KoodiType> koodiTypeList = this.koodistoClient.getKoodisForKoodisto("maatjavaltiot2", 1,
                true);

        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        if (kansalaisuusSet != null && !kansalaisuusSet.stream().map(Kansalaisuus::getKansalaisuusKoodi)
                .allMatch(kansalaisuus -> koodiTypeList.stream()
                        .anyMatch(koodi -> koodi.getKoodiArvo().equals(kansalaisuus)))) {
            errors.rejectValue("kansalaisuudet", "invalid.kansalaisuusKoodi");
        }

    }
}
