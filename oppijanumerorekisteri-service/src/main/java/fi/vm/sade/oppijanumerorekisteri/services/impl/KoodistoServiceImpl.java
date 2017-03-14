package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.springframework.stereotype.Service;

@Service
public class KoodistoServiceImpl implements KoodistoService {

    private final KoodistoClient koodistoClient;

    public KoodistoServiceImpl(KoodistoClient koodistoClient) {
        this.koodistoClient = koodistoClient;
    }

    @Override
    public Iterable<KoodiType> list(Koodisto koodisto) {
        return koodistoClient.getKoodisForKoodisto(koodisto.getUri(), koodisto.getVersio(), true);
    }

}
