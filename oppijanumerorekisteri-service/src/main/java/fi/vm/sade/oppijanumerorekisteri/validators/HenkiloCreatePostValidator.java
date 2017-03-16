package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.Set;
import static java.util.stream.Collectors.toSet;

@Component
public class HenkiloCreatePostValidator implements Validator {
    private KoodistoService koodistoService;
    private HenkiloRepository henkiloRepository;

    @Autowired
    public HenkiloCreatePostValidator(KoodistoService koodistoService, HenkiloRepository henkiloRepository) {
        this.koodistoService = koodistoService;
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

        KoodiValidator koodiValidator = new KoodiValidator(koodistoService, errors);

        koodiValidator.validate(Koodisto.SUKUPUOLI, henkilo.getSukupuoli(),
                "sukupuoli", "invalid.sukupuoli");

        Set<Kansalaisuus> kansalaisuusSet = henkilo.getKansalaisuus();
        if (kansalaisuusSet != null) {
            Set<String> kansalaisuusKoodit = kansalaisuusSet.stream()
                    .map(Kansalaisuus::getKansalaisuusKoodi).collect(toSet());
            koodiValidator.validate(Koodisto.MAAT_JA_VALTIOT_2, kansalaisuusKoodit,
                    "kansalaisuus", "invalid.kansalaisuusKoodi");
        }

        Set<YhteystiedotRyhma> yhteystiedot = henkilo.getYhteystiedotRyhma();
        if (yhteystiedot != null && !yhteystiedot.isEmpty()) {
            Set<String> tyypit = yhteystiedot.stream()
                    .map(YhteystiedotRyhma::getRyhmaKuvaus).collect(toSet());
            koodiValidator.validate(Koodisto.YHTEYSTIETOTYYPIT, tyypit,
                    "yhteystiedotRyhma", "invalid.ryhmaKuvaus");
            Set<String> alkuperat = yhteystiedot.stream()
                    .map(YhteystiedotRyhma::getRyhmaAlkuperaTieto).collect(toSet());
            koodiValidator.validate(Koodisto.YHTEYSTIETOJEN_ALKUPERA, alkuperat,
                    "yhteystiedotRyhma", "invalid.ryhmaAlkuperaTieto");
        }
    }

}
