package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.List;
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
        if (!StringUtils.isEmpty(hetu) && this.henkiloRepository.exists(QHenkilo.henkilo.hetu.eq(hetu))) {
            errors.rejectValue("hetu", "socialsecuritynr.already.exists");
        }

        if(henkilo.getSukupuoli() != null &&
            this.koodistoClient.getKoodiValuesForKoodisto("sukupuoli", 1, true)
                    .stream().noneMatch(koodiArvo -> koodiArvo.equals(henkilo.getSukupuoli())) ) {
            errors.rejectValue("sukupuoli", "invalid.sukupuoli");
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

        Set<YhteystiedotRyhma> yhteystiedotRyhmat = henkilo.getYhteystiedotRyhma();
        List<KoodiType> yhteystietotyypit = this.koodistoClient.getKoodisForKoodisto("yhteystietotyypit", 1,
                true);
        if (yhteystiedotRyhmat != null && !yhteystiedotRyhmat.stream().map(YhteystiedotRyhma::getRyhmaKuvaus)
                .allMatch(ryhmaKuvaus -> yhteystietotyypit.stream()
                        .anyMatch(koodi -> koodi.getKoodiArvo().equals(ryhmaKuvaus)))) {
            errors.rejectValue("yhteystiedotRyhma", "invalid.ryhmaKuvaus");
        }
        List<KoodiType> yhteystietojenalkuperat = this.koodistoClient.getKoodisForKoodisto("yhteystietojenalkupera", 1,
                true);
        if (yhteystiedotRyhmat != null && !yhteystiedotRyhmat.stream().map(YhteystiedotRyhma::getRyhmaAlkuperaTieto)
                .allMatch(alkupera -> yhteystietojenalkuperat.stream()
                        .anyMatch(koodi -> koodi.getKoodiArvo().equals(alkupera)))) {
            errors.rejectValue("yhteystiedotRyhma", "invalid.ryhmaAlkuperaTieto");
        }

    }
}
