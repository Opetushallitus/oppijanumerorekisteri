package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.Task;
import com.github.kagkarlsson.scheduler.task.TaskWithoutDataDescriptor;
import com.github.kagkarlsson.scheduler.task.helper.Tasks;
import com.github.kagkarlsson.scheduler.task.schedule.Daily;
import com.github.kagkarlsson.scheduler.task.schedule.FixedDelay;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.security.OphSessionMappingStorage;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.MuutostietoService;
import fi.vm.sade.oppijanumerorekisteri.services.VtjMuutostietoService;
import fi.vm.sade.oppijanumerorekisteri.services.death.CleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;

/**
 * Ajastuksen aktivointi.
 *
 * *Task-luokat sisältävät ajastusten konfiguroinnit
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class SchedulingConfiguration {
    private final OppijanumerorekisteriProperties properties;
    private final CleanupService cleanupService;
    private final OphSessionMappingStorage sessionMappingStorage;
    private final MuutostietoService muutostietoService;
    private final IdentificationService identificationService;
    private final VtjMuutostietoService vtjMuutostietoService;

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.scheduling.yksilointi.enabled", matchIfMissing = true)
    Task<Void> yksilointiTask() {
        return Tasks
                .recurring(new TaskWithoutDataDescriptor("yksilointi task"),
                        FixedDelay.ofMillis(properties.getScheduling().getYksilointi().getFixedDelayInMillis()))
                .execute((instance, ctx) -> {
                    log.info("Identification started...");
                    long start = System.currentTimeMillis();

                    identificationService.yksilointiTask();

                    long duration = System.currentTimeMillis() - start;
                    log.info("Identification completed, duration: " + duration + "ms");
                });
    }

    @Bean
    Task<Void> casClientSessionCleanerTask() {
        return Tasks
                .recurring(new TaskWithoutDataDescriptor("cas client session cleaner"), FixedDelay.ofHours(1))
                .execute((instance, ctx) -> sessionMappingStorage.clean());
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.scheduling.vtjsync.enabled", matchIfMissing = true)
    Task<Void> henkilotietomuutosHetuSyncTask() {
        return Tasks
                .recurring(new TaskWithoutDataDescriptor("henkilotietomuutos hetu sync task"),
                        FixedDelay.ofMillis(properties.getScheduling().getVtjsync().getFixedDelayInMillis()))
                .execute((instance, ctx) -> muutostietoService.sendHetus());
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.vtj-muutosrajapinta.enabled", matchIfMissing = true)
    Task<Void> vtjMuutostietoSyncTask() {
        return Tasks
                .recurring(new TaskWithoutDataDescriptor("vtj muutostieto fetch task"), FixedDelay.ofHours(1))
                .execute((instance, ctx) -> vtjMuutostietoService.fetchHenkiloMuutostieto());
    }

    @Bean
    Task<Void> deathCleanupTask() {
        return Tasks
                .recurring(new TaskWithoutDataDescriptor("DeathCleanupTask"),
                        new Daily(LocalTime.of(properties.getScheduling().getDeathCleanup().getHour(),
                                properties.getScheduling().getDeathCleanup().getMinute())))
                .execute((instance, ctx) -> cleanupService.run());
    }
}
