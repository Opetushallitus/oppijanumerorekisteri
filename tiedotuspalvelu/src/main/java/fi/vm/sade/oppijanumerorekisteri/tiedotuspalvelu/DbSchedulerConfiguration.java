package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.github.kagkarlsson.scheduler.task.Task;
import com.github.kagkarlsson.scheduler.task.helper.Tasks;
import com.github.kagkarlsson.scheduler.task.schedule.Schedules;
import fi.vm.sade.JdbcSessionMappingStorage;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale.FetchLocalisationsTask;
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

  private final FetchOppijaTask fetchOppijaTask;
  private final SendSuomiFiViestitTask sendSuomiFiViestitTask;
  private final FetchSuomiFiEventsTask fetchSuomiFiEventsTask;
  private final FetchLocalisationsTask fetchLocalisationsTask;
  private final JdbcSessionMappingStorage jdbcSessionMappingStorage;

  @Bean
  @ConditionalOnProperty(name = "tiedotuspalvelu.fetch-oppija.enabled", havingValue = "true")
  public Task<Void> fetchOppijaTaskBean() {
    return Tasks.recurring("fetch-oppija-task", Schedules.fixedDelay(Duration.ofSeconds(10)))
        .execute((inst, ctx) -> fetchOppijaTask.execute());
  }

  @Bean
  @ConditionalOnProperty(name = "tiedotuspalvelu.suomifi-viestit.enabled", havingValue = "true")
  public Task<Void> sendSuomiFiViestitTaskBean() {
    return Tasks.recurring(
            "send-suomi-fi-viestit-task", Schedules.fixedDelay(Duration.ofSeconds(10)))
        .execute((inst, ctx) -> sendSuomiFiViestitTask.execute());
  }

  @Bean
  @ConditionalOnProperty(name = "tiedotuspalvelu.suomifi-viestit.enabled", havingValue = "true")
  public Task<Void> fetchSuomiFiEventsTaskBean() {
    return Tasks.recurring(
            "fetch-suomi-fi-viestit-events-task", Schedules.fixedDelay(Duration.ofMinutes(1)))
        .execute((inst, ctx) -> fetchSuomiFiEventsTask.execute());
  }

  @Bean
  @ConditionalOnProperty(name = "tiedotuspalvelu.fetch-localisations.enabled", havingValue = "true")
  public Task<Void> fetchLocalisationsTaskBean() {
    return Tasks.recurring("fetch-localisations-task", Schedules.fixedDelay(Duration.ofMinutes(5)))
        .execute((inst, ctx) -> fetchLocalisationsTask.execute());
  }

  @Bean
  public Task<Void> casClientSessionCleanerTaskBean() {
    return Tasks.recurring("cas-client-session-cleaner", Schedules.fixedDelay(Duration.ofHours(1)))
        .execute(
            (inst, ctx) -> {
              jdbcSessionMappingStorage.clean();
              log.info("Finished running CasClientSessionCleanerTask");
            });
  }
}
