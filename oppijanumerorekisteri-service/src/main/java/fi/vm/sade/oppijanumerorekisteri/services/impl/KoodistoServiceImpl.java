package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import static fi.vm.sade.oppijanumerorekisteri.configurations.CacheConfiguration.CACHE_NAME_KOODISTOT;

@Service
@CacheConfig(cacheNames = CACHE_NAME_KOODISTOT)
public class KoodistoServiceImpl implements KoodistoService {

    private final KoodistoClient koodistoClient;

    public KoodistoServiceImpl(KoodistoClient koodistoClient) {
        this.koodistoClient = koodistoClient;
    }

    @Override
    @Cacheable
    public Iterable<KoodiType> list(Koodisto koodisto) {
        return koodistoClient.getKoodisForKoodisto(koodisto.getUri(), koodisto.getVersio(), false);
    }

}
