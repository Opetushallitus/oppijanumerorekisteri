package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.death.CleanupTask;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Slf4j
public abstract class AbstractCleanupTask implements CleanupTask {

    @Autowired
    protected OppijanumerorekisteriProperties properties;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean applyTo(Henkilo subject) {
        try {
            apply(subject);
            subject.setCleanupStep(getCleanupStep());
            subject.setModified(new Date());
            subject.setKasittelijaOid(properties.getRootUserOid());
            return true;
        } catch (Exception e) {
            log.error(String.format("Failed to run cleanup step %s on user with oid: %s",
                    getCleanupStep().name(), subject.getOidHenkilo()), e);
            return false;
        }
    }

    protected abstract void apply(Henkilo subject);
}
