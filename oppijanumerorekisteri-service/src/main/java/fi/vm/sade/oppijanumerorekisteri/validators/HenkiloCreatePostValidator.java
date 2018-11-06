package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;

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
    public boolean supports(@NotNull Class<?> aClass) {
        return Henkilo.class.equals(aClass);
    }

    @Override
    public void validate(Object o, @NotNull Errors errors) {
        Henkilo henkilo = (Henkilo) o;

        String hetu = henkilo.getHetu();
        if (!StringUtils.isEmpty(hetu)) {
            Stream<Function<String, Optional<Henkilo>>> findByHetuFunctions = Stream
                    .of(henkiloRepository::findByHetu, henkiloRepository::findByKaikkiHetut);
            findByHetuFunctions.forEach(findByHetuFun -> findByHetuFun.apply(hetu).ifPresent(henkiloByHetu
                    -> errors.rejectValue("hetu", "socialsecuritynr.already.exists")));
        }

        KutsumanimiValidator kutsumanimiValidator = new KutsumanimiValidator(henkilo.getEtunimet());
        if (!kutsumanimiValidator.isValid(henkilo.getKutsumanimi())) {
            errors.rejectValue("kutsumanimi",
                    "kutsumanimi.must.exist.in.etunimet",
                    new Object[]{henkilo.getKutsumanimi(), henkilo.getEtunimet()},
                    "Kutsumanimen on oltava osa etunimeä");
        }

        KoodiValidator koodiValidator = new KoodiValidator(koodistoService, errors);

        koodiValidator.validate(Koodisto.SUKUPUOLI, henkilo.getSukupuoli(),
                "sukupuoli", "invalid.sukupuoli");

        koodiValidator.validate(Koodisto.KUNTA, henkilo.getKotikunta(), "kotikunta", "invalid.kotikunta");

        if (henkilo.getAidinkieli() != null) {
            koodiValidator.validate(Koodisto.KIELI,
                    String::toLowerCase, // koodistossa koodiarvot ovat virheellisesti isoilla kirjaimilla
                    henkilo.getAidinkieli().getKieliKoodi(),  "aidinkieli.kieliKoodi", "invalid.aidinkieli");
        }

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
