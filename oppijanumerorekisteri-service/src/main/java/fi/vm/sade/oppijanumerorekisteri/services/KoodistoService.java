package fi.vm.sade.oppijanumerorekisteri.services;


import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;

import javax.validation.ValidationException;
import java.util.Set;

public interface KoodistoService {
    void validateKansalaisuus(Set<Kansalaisuus> kansalaisuusSet) throws ValidationException;
}
