package fi.vm.sade.oppijanumerorekisteri.services.death;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;

public interface CleanupTask {

    CleanupStep getCleanupStep();

    boolean applyTo(String oid);
}
