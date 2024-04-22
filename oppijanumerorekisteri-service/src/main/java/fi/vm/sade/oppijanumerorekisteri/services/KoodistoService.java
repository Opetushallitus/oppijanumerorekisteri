package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;

public interface KoodistoService {

    Iterable<KoodiType> list(Koodisto koodisto);

}
