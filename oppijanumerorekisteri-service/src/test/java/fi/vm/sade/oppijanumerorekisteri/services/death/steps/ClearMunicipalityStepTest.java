package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ClearMunicipalityStepTest {

    final ClearMunicipalityStep step = new ClearMunicipalityStep();

    @Mock
    Henkilo subject;

    @Mock
    OppijanumerorekisteriProperties properties;

    @Mock
    HenkiloRepository henkiloRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        step.properties = properties;
        step.henkiloRepository = henkiloRepository;
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(subject));
    }

    @Test
    void updatesCleanupStep() {
        step.applyTo("oid");

        verify(subject, times(1)).setCleanupStep(CleanupStep.CLEAR_MUNICIPALITY);
        verify(subject, times(1)).setKotikunta(null);
    }
}

