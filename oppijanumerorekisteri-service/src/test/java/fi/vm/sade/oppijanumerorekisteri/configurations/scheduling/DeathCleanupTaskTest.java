package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.services.death.CleanupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Answers;

import static org.mockito.Mockito.*;

class DeathCleanupTaskTest {

    private OppijanumerorekisteriProperties properties;

    private CleanupService service;

    private DeathCleanupTask deathCleanupTask;

    @BeforeEach
    void setUp() {
        properties = mock(OppijanumerorekisteriProperties.class, Answers.RETURNS_DEEP_STUBS);
        service = mock(CleanupService.class, Answers.RETURNS_DEEP_STUBS);
        deathCleanupTask = new DeathCleanupTask(properties, service);
    }

    @Test
    void invokesService() {
        deathCleanupTask.executeRecurringly(null, null);
        verify(service, times(1)).run();
    }
}
