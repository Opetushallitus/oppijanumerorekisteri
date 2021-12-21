package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Set;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RemoveContactInformationStepTest {

    final RemoveContactInformationStep step = new RemoveContactInformationStep();

    @Mock
    Henkilo subject;

    @Mock
    Set<YhteystiedotRyhma> contactInfo;

    @Mock
    OppijanumerorekisteriProperties properties;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        step.properties = properties;
    }

    @Test
    void clearsContactInformation() {
        given(subject.getYhteystiedotRyhma()).willReturn(contactInfo);

        step.applyTo(subject);

        verify(subject, times(1)).setCleanupStep(CleanupStep.REMOVE_CONTACT_INFORMATION);
        verify(contactInfo, times(1)).clear();
    }
}
