package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.ExecutionContext;
import com.github.kagkarlsson.scheduler.task.TaskInstance;
import com.github.kagkarlsson.scheduler.task.helper.RecurringTask;
import com.github.kagkarlsson.scheduler.task.schedule.FixedDelay;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
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
    private final OppijaTuontiService oppijaTuontiService;

    @Autowired
    public YksilointiTask(OppijanumerorekisteriProperties properties,
                          HenkiloRepository henkiloRepository,
                          IdentificationService identificationService,
                          OppijaTuontiService oppijaTuontiService) {
        super("yksilointi task", FixedDelay.of(Duration.ofMillis(properties.getScheduling().getYksilointi().getFixedDelayInMillis())), Void.class, null);
        this.properties = properties;
        this.henkiloRepository = henkiloRepository;
        this.identificationService = identificationService;
        this.oppijaTuontiService = oppijaTuontiService;
    }

    @Override
    public void executeRecurringly(TaskInstance taskInstance, ExecutionContext executionContext) {
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

            // Onko oppijoiden tuonteja valmistunut ja onko tarvetta lähettää sähköposti-ilmoitus
            oppijaTuontiService.handleOppijaTuontiIlmoitus();
        }
    }
}
