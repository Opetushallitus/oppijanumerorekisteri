package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

/**
 * Ajastusten konfigurointi.
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private OppijanumerorekisteriProperties.Scheduling.Yksilointi properties;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private HenkiloJpaRepository henkiloJpaRepository;

    @Autowired
    public void setProperties(OppijanumerorekisteriProperties properties) {
        this.properties = properties.getScheduling().getYksilointi();
    }

    @Scheduled(cron = "${oppijanumerorekisteri.scheduling.yksilointi.cron}")
    @Transactional
    public void startYksilointiTask() {
        if (!properties.getEnabled()) {
            return;
        }

        log.info("Identification started...");
        long start = System.currentTimeMillis();

        Long offset = 0L;
        Collection<Henkilo> unidentified = henkiloJpaRepository.findUnidentified(properties.getBatchSize(), offset);
        henkiloJpaRepository.findOidByHetu("111111-9138");
        while (!unidentified.isEmpty()) {
            identificationService.identifyHenkilos(unidentified, properties.getVtjRequestDelayInMillis());
            offset += properties.getBatchSize();
            unidentified = henkiloJpaRepository.findUnidentified(properties.getBatchSize(), offset);
        }

        long duration = System.currentTimeMillis() - start;
        log.info("Identification completed, duration: " + duration + "ms");
    }

}
