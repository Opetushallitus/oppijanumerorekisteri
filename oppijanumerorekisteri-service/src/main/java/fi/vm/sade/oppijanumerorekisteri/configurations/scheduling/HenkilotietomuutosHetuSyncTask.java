package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.ExecutionContext;
import com.github.kagkarlsson.scheduler.task.TaskInstance;
import com.github.kagkarlsson.scheduler.task.helper.RecurringTask;
import com.github.kagkarlsson.scheduler.task.schedule.FixedDelay;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.services.MuutostietoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Component
public class HenkilotietomuutosHetuSyncTask extends RecurringTask {

    private final OppijanumerorekisteriProperties properties;
    private final MuutostietoService muutostietoService;

    @Autowired
    public HenkilotietomuutosHetuSyncTask(OppijanumerorekisteriProperties properties,
                                          MuutostietoService muutostietoService) {
        super("henkilotietomuutos hetu sync task", FixedDelay.of(Duration.ofMillis(properties.getScheduling().getVtjsync().getFixedDelayInMillis())), Void.class, null);
        this.properties = properties;
        this.muutostietoService = muutostietoService;
    }

    @Override
    public void executeRecurringly(TaskInstance taskInstance, ExecutionContext executionContext) {
        if (properties.getScheduling().getVtjsync().getEnabled()) {
            muutostietoService.sendHetus();
        }
    }
}
