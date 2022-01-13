package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.stereotype.Component;

/**
 * No Operation Death Cleanup Step - Used as a sentry
 */
@Component
public class NOPStep extends AbstractCleanupTask {

    @Override
    public CleanupStep getCleanupStep() {
        return CleanupStep.INITIATED;
    }

    @Override
    protected void apply(Henkilo subject) {
        // NOP
    }
}
