package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.stereotype.Component;

/**
 * Home municipality information is no more relevant after
 * subject has passed away, thus clearing it from the database.
 * Will mess up statistics unless done.
 */
@Component
public class ClearMunicipalityStep extends AbstractCleanupTask {

    @Override
    public CleanupStep getCleanupStep() {
        return CleanupStep.CLEAR_MUNICIPALITY;
    }

    @Override
    protected void apply(Henkilo subject) {
        subject.setKotikunta(null);
    }
}
