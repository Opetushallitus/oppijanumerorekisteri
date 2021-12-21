package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.stereotype.Component;

@Component
public class RemoveContactInformationStep extends AbstractCleanupTask {

    @Override
    public CleanupStep getCleanupStep() {
        return CleanupStep.REMOVE_CONTACT_INFORMATION;
    }

    @Override
    protected void apply(Henkilo subject) {
        subject.getYhteystiedotRyhma().clear();
    }
}
