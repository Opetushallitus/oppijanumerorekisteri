package fi.vm.sade.oppijanumerorekisteri.services.death;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

public interface CleanupTask {

    CleanupStep getCleanupStep();

    boolean applyTo(Henkilo person);
}
