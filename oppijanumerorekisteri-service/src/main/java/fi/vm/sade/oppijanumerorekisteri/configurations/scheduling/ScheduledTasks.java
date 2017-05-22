package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Collection;

import static org.apache.commons.lang3.StringUtils.isEmpty;

/**
 * Ajastusten konfigurointi.
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    @Value("${vtj-service.url}")
    private String vtjServiceUrl;

    @Value("${oppijanumerorekisteri.scheduling.configuration.batch.limit}")
    private Long BATCH_LIMIT;

    @Value("${oppijanumerorekisteri.scheduling.configuration.batch.delay-time-in-millis}")
    private Long VTJ_REQUEST_DELAY_IN_MILLIS;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private HenkiloJpaRepository henkiloJpaRepository;

    @Scheduled(cron = "${oppijanumerorekisteri.scheduling.configuration.yksilointi}")
    public void startYksilointiTask() {
        if (isEmpty(vtjServiceUrl)) {
            log.info("Skipping identification job - VTJ url is empty!");
            return;
        }
        log.info("Identification started...");
        long start = System.currentTimeMillis();

        try {
            Long offset = 0L;
            Collection<Henkilo> unidentified = henkiloJpaRepository.findUnidentified(BATCH_LIMIT, offset);
            while(!unidentified.isEmpty()) {
                identificationService.identifyHenkilos(unidentified, VTJ_REQUEST_DELAY_IN_MILLIS);
                offset += BATCH_LIMIT;
                unidentified = henkiloJpaRepository.findUnidentified(BATCH_LIMIT, offset);
            }

        } catch (Exception e) {
            log.error("Identification sync service failed!", e);
        } catch (Throwable t) {
            log.error("Internal error, throwable catched", t);
        }

        long duration = System.currentTimeMillis() - start;
        log.info("Identification completed, duration: " + duration + "ms");
    }

}
