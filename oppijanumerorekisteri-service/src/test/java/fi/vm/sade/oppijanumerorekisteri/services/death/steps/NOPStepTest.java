package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class NOPStepTest {

    final NOPStep step = new NOPStep();

    @Mock
    Henkilo subject;

    @Mock
    OppijanumerorekisteriProperties properties;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        step.properties = properties;
    }

    @Test
    void updatesCleanupStep() {
        step.applyTo(subject);

        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }
}
