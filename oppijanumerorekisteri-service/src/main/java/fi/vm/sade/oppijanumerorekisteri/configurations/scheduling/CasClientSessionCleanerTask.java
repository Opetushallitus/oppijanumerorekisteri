package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.ExecutionContext;
import com.github.kagkarlsson.scheduler.task.TaskInstance;
import com.github.kagkarlsson.scheduler.task.helper.RecurringTask;
import com.github.kagkarlsson.scheduler.task.schedule.FixedDelay;
import fi.vm.sade.oppijanumerorekisteri.configurations.security.OphSessionMappingStorage;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class CasClientSessionCleanerTask extends RecurringTask {

    private final OphSessionMappingStorage sessionMappingStorage;

    public CasClientSessionCleanerTask(OphSessionMappingStorage sessionMappingStorage) {
        super("cas client session cleaner", FixedDelay.of(Duration.ofHours(1)), Void.class, null);
        this.sessionMappingStorage = sessionMappingStorage;
    }

    @Override
    public void executeRecurringly(TaskInstance taskInstance, ExecutionContext executionContext) {
        sessionMappingStorage.clean();
    }

}
