package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
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

    @Autowired
    protected HenkiloRepository henkiloRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean applyTo(final String oid) {
        try {
            Henkilo subject = henkiloRepository.findByOidHenkilo(oid)
                    .orElseThrow(() -> new RuntimeException("Could not find Henkilo with oid: " + oid));
            apply(subject);
            subject.setCleanupStep(getCleanupStep());
            subject.setModified(new Date());
            subject.setKasittelijaOid(properties.getRootUserOid());
            return true;
        } catch (Exception e) {
            log.error("Failed to run cleanup step {} on user with oid: \"{}\"",
                    getCleanupStep().name(), oid, e);
            return false;
        }
    }

    protected abstract void apply(Henkilo subject);
}
