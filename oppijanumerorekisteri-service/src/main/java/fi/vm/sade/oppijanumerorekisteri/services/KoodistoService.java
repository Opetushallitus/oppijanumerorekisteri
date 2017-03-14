package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.koodisto.service.types.common.KoodiType;

public interface KoodistoService {

    Iterable<KoodiType> list(Koodisto koodisto);

}
