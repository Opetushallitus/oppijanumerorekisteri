package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.ValidationException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class KoodistoServiceImpl implements KoodistoService {
    private KoodistoClient koodistoClient;

    @Autowired
    public KoodistoServiceImpl(KoodistoClient koodistoClient) {
        this.koodistoClient = koodistoClient;
    }

    @Override
    public void validateKansalaisuus(Set<Kansalaisuus> kansalaisuusSet) throws ValidationException {
        List<KoodiType> koodiTypeList = koodistoClient.getKoodisForKoodisto("maatjavaltiot2", 1, true);

        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        Stream<String> kansalaisuuskoodiSet = kansalaisuusSet.stream().map(Kansalaisuus::getKansalaisuuskoodi);
        Set<String> koodiArvoSet = koodiTypeList.stream().map(KoodiType::getKoodiArvo).collect(Collectors.toSet());
        if(!kansalaisuuskoodiSet.allMatch(k -> koodiArvoSet.stream().anyMatch(k::equals))) {
            throw new ValidationException("invalid_kansalaisuuskoodi");
        }
    }
}
