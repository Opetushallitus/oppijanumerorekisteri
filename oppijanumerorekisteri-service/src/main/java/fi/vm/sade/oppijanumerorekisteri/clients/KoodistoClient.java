package fi.vm.sade.oppijanumerorekisteri.clients;

import java.util.List;

import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;

public interface KoodistoClient {
    List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis);
}
