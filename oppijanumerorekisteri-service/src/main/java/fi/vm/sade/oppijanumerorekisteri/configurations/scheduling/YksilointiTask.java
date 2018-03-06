package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.ExecutionContext;
import com.github.kagkarlsson.scheduler.task.FixedDelay;
import com.github.kagkarlsson.scheduler.task.RecurringTask;
import com.github.kagkarlsson.scheduler.task.TaskInstance;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collection;

/**
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Slf4j
@Component
public class YksilointiTask extends RecurringTask {

    private final OppijanumerorekisteriProperties properties;
    private final HenkiloRepository henkiloRepository;
    private final IdentificationService identificationService;

    @Autowired
    public YksilointiTask(OppijanumerorekisteriProperties properties,
                          HenkiloRepository henkiloRepository,
                          IdentificationService identificationService) {
        super("yksilointi task", FixedDelay.of(Duration.ofMillis(properties.getScheduling().getYksilointi().getFixedDelayInMillis())));
        this.properties = properties;
        this.henkiloRepository = henkiloRepository;
        this.identificationService = identificationService;
    }

    @Override
    public void execute(TaskInstance<Void> taskInstance, ExecutionContext executionContext) {
        if (properties.getScheduling().getYksilointi().getEnabled()) {
            log.info("Identification started...");
            long start = System.currentTimeMillis();
            OppijanumerorekisteriProperties.Scheduling.Yksilointi yksilointiProperties = properties.getScheduling().getYksilointi();

            Long offset = 0L;
            Collection<Henkilo> unidentifiedHenkilos = henkiloRepository.findUnidentified(yksilointiProperties.getBatchSize(), offset);
            while (!unidentifiedHenkilos.isEmpty()) {
                identificationService.identifyHenkilos(unidentifiedHenkilos, yksilointiProperties.getVtjRequestDelayInMillis());
                offset += yksilointiProperties.getBatchSize();
                unidentifiedHenkilos = henkiloRepository.findUnidentified(yksilointiProperties.getBatchSize(), offset);
            }

            long duration = System.currentTimeMillis() - start;
            log.info("Identification completed, duration: " + duration + "ms");
        }

    }
}
