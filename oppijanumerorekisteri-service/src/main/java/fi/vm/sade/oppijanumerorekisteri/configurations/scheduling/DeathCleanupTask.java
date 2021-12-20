package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.ExecutionContext;
import com.github.kagkarlsson.scheduler.task.TaskInstance;
import com.github.kagkarlsson.scheduler.task.helper.RecurringTask;
import com.github.kagkarlsson.scheduler.task.schedule.Daily;
import com.github.kagkarlsson.scheduler.task.schedule.Schedule;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.services.death.CleanupService;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class DeathCleanupTask extends RecurringTask {

    private final CleanupService cleanupService;

    public DeathCleanupTask(OppijanumerorekisteriProperties properties, CleanupService service) {
        super("DeathCleanupTask", getScheduling(properties), Void.class, null);
        this.cleanupService = service;
    }

    private static Schedule getScheduling(OppijanumerorekisteriProperties properties) {
        return new Daily(LocalTime.of(
                properties.getScheduling().getDeathCleanup().getHour(),
                properties.getScheduling().getDeathCleanup().getMinute()));
    }

    @Override
    public void executeRecurringly(TaskInstance taskInstance, ExecutionContext executionContext) {
        cleanupService.run();
    }
}
