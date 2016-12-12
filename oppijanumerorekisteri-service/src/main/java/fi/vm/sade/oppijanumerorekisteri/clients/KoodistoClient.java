package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.koodisto.service.types.common.KoodiType;

import java.util.List;

public interface KoodistoClient {
    List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis);
}
