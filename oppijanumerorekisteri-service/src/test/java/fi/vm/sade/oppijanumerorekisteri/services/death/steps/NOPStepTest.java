package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.death.CleanupTask;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

class NOPStepTest {

    private final CleanupTask step = new NOPStep();

    @Test
    void updatesCleanupStep() {
        Henkilo subject = mock(Henkilo.class);
        step.applyTo(subject);
        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }
}
