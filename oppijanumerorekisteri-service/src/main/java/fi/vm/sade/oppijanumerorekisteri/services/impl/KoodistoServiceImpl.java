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
    public void postvalidateKansalaisuus(Set<Kansalaisuus> kansalaisuusSet) throws ValidationException {
        List<KoodiType> koodiTypeList = koodistoClient.getKoodisForKoodisto("maatjavaltiot2", 1, true);

        // Make sure that all values from kansalaisuusSet are found from koodiTypeList.
        if(!kansalaisuusSet.stream().map(Kansalaisuus::getKansalaisuuskoodi)
                .allMatch(kansalaisuus -> koodiTypeList.stream()
                        .anyMatch(koodi -> koodi.getKoodiArvo().equals(kansalaisuus)))) {
            throw new ValidationException("invalid_kansalaisuuskoodi");
        }
    }
}
