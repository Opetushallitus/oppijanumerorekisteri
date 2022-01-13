package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

class ClearONRDataStepTest {
    final ClearONRDataStep step = new ClearONRDataStep();

    @Mock
    Henkilo subject;

    @Mock
    Set<YhteystiedotRyhma> contactInfo;

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
        given(subject.getYhteystiedotRyhma()).willReturn(contactInfo);

        step.applyTo("oid");

        verify(subject, times(1)).setCleanupStep(CleanupStep.CLEAR_ONR_DATA);
        verify(subject, times(1)).setPassivoitu(true);
        verify(subject, times(1)).setKotikunta(null);
        verify(contactInfo, times(1)).clear();
    }
}
