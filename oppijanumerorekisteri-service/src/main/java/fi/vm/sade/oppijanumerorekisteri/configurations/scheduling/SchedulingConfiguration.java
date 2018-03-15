package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;


import com.github.kagkarlsson.scheduler.Scheduler;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Ajastuksen aktivointi.
 *
 * *Task-luokat sisältävät ajastusten konfiguroinnit
 */
@Configuration
@ConditionalOnProperty(name = "oppijanumerorekisteri.scheduling.enabled", matchIfMissing = true)
public class SchedulingConfiguration {
    @Bean(destroyMethod = "stop")
    Scheduler scheduler(@Qualifier("dataSource") DataSource dataSource,
                        YksilointiTask yksilointiTask,
                        HenkilotietomuutosHetuSyncTask henkilotietomuutosHetuSyncTask) {
        Scheduler scheduler = Scheduler.create(dataSource)
                .startTasks(yksilointiTask, henkilotietomuutosHetuSyncTask)
                .threads(1)
                .build();
        scheduler.start();
        return scheduler;
    }
}
