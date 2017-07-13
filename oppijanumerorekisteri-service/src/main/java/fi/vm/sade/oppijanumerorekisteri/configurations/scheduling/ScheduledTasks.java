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

    private final IdentificationService identificationService;

    private final HenkiloJpaRepository henkiloJpaRepository;

    @Autowired
    public void setProperties(OppijanumerorekisteriProperties properties) {
        this.properties = properties.getScheduling().getYksilointi();
    }

    @Scheduled(fixedDelayString = "${oppijanumerorekisteri.scheduling.yksilointi.fixed-delay-in-millis}")
    public void startYksilointiTask() {
        if (properties.getEnabled()) {
            log.info("Identification started...");
            long start = System.currentTimeMillis();

            Long offset = 0L;
            Collection<Henkilo> unidentifiedHenkilos = henkiloJpaRepository.findUnidentified(properties.getBatchSize(), offset);
            while (!unidentifiedHenkilos.isEmpty()) {
                identificationService.identifyHenkilos(unidentifiedHenkilos, properties.getVtjRequestDelayInMillis());
                offset += properties.getBatchSize();
                unidentifiedHenkilos = henkiloJpaRepository.findUnidentified(properties.getBatchSize(), offset);
            }

            long duration = System.currentTimeMillis() - start;
            log.info("Identification completed, duration: " + duration + "ms");
        }

    }

}
