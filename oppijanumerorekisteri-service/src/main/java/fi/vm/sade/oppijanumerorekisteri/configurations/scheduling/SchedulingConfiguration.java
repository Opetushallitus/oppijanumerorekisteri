package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;


import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Ajastuksen aktivointi.
 *
 * @see ScheduledTasks ajastusten konfigurointi
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "oppijanumerorekisteri.scheduling.enabled")
public class SchedulingConfiguration {

}
