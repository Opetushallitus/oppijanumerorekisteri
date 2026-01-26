package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.github.kagkarlsson.scheduler.task.Task;
import com.github.kagkarlsson.scheduler.task.helper.Tasks;
import com.github.kagkarlsson.scheduler.task.schedule.Schedules;
import java.time.Duration;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
@AllArgsConstructor
public class DbSchedulerConfiguration {

  private final SuomiFiViestitTask suomiFiViestitTask;

  @Bean
  @ConditionalOnProperty(name = "tiedotuspalvelu.suomifi-viestit.enabled", havingValue = "true")
  public Task<Void> suomiFiViestitTaskBean() {
    return Tasks.recurring(
            "send-suomi-fi-viestit-task", Schedules.fixedDelay(Duration.ofSeconds(10)))
        .execute((inst, ctx) -> suomiFiViestitTask.execute());
  }
}
