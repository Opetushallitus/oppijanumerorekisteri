package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RemoveAccessRightsStep extends AbstractCleanupTask {

    @Autowired
    protected KayttooikeusClient kayttooikeusClient;

    @Override
    public CleanupStep getCleanupStep() {
        return CleanupStep.REMOVE_ACCESS_RIGHTS;
    }

    @Override
    protected void apply(Henkilo subject) {
        kayttooikeusClient.passivoiHenkilo(subject.getOidHenkilo(), properties.getRootUserOid());
    }
}
