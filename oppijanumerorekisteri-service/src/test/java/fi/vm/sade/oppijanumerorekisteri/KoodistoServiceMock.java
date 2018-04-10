package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;

import static java.util.Collections.emptyList;

public class KoodistoServiceMock implements KoodistoService {

    @Override
    public Iterable<KoodiType> list(Koodisto koodisto) {
        return emptyList();
    }

}
