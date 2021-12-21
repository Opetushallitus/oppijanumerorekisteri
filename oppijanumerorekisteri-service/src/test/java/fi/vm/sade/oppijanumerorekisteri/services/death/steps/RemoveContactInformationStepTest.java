package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.death.CleanupTask;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

class RemoveContactInformationStepTest {

    private final CleanupTask step = new RemoveContactInformationStep();

    @Test
    void clearsContactInformation() {
        Set contactInfo = mock(Set.class);
        Henkilo subject = mock(Henkilo.class);
        given(subject.getYhteystiedotRyhma()).willReturn(contactInfo);

        step.applyTo(subject);

        verify(subject, times(1)).setCleanupStep(CleanupStep.REMOVE_CONTACT_INFORMATION);
        verify(contactInfo, times(1)).clear();
    }
}
