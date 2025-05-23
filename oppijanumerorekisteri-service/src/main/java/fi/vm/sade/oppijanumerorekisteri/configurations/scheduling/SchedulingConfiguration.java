package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.Task;
import com.github.kagkarlsson.scheduler.task.TaskDescriptor;
import com.github.kagkarlsson.scheduler.task.helper.Tasks;
import com.github.kagkarlsson.scheduler.task.schedule.Daily;
import com.github.kagkarlsson.scheduler.task.schedule.FixedDelay;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.security.OphSessionMappingStorage;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.QueueingEmailService;
import fi.vm.sade.oppijanumerorekisteri.services.VtjMuutostietoService;
import fi.vm.sade.oppijanumerorekisteri.services.datantuonti.DatantuontiExportService;
import fi.vm.sade.oppijanumerorekisteri.services.datantuonti.DatantuontiImportService;
import fi.vm.sade.oppijanumerorekisteri.services.datantuonti.TestidatantuontiImportService;
import fi.vm.sade.oppijanumerorekisteri.services.death.CleanupService;
import fi.vm.sade.oppijanumerorekisteri.services.export.ExportService;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.VtjKyselyCertificationCheck;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.LocalTime;

/**
 * Ajastuksen aktivointi.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class SchedulingConfiguration {
    private final OppijanumerorekisteriProperties properties;
    private final CleanupService cleanupService;
    private final OphSessionMappingStorage sessionMappingStorage;
    private final IdentificationService identificationService;
    private final VtjMuutostietoService vtjMuutostietoService;
    private final ExportService exportService;
    private final DatantuontiExportService datantuontiExportService;
    private final DatantuontiImportService datantuontiImportService;
    private final TestidatantuontiImportService testidatantuontiImportService;
    private final QueueingEmailService queueingEmailService;
    private final VtjKyselyCertificationCheck vtjKyselyCertificationCheck;

    @Bean
    Task<Void> casClientSessionCleanerTask() {
        return Tasks
                .recurring(TaskDescriptor.of("cas client session cleaner"), FixedDelay.ofHours(1))
                .execute((instance, ctx) -> sessionMappingStorage.clean());
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.scheduling.yksilointi.enabled", matchIfMissing = true)
    Task<Void> yksilointiTask() {
        return Tasks
                .recurring(TaskDescriptor.of("yksilointi task"),
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
    @ConditionalOnProperty(name = "oppijanumerorekisteri.vtj-muutosrajapinta.perustieto-enabled", matchIfMissing = false)
    Task<Void> vtjPerustietoTask() {
        return Tasks
                .recurring(TaskDescriptor.of("vtj perustieto task"), FixedDelay.ofMinutes(15))
                .execute((instance, ctx) -> vtjMuutostietoService.handlePerustietoTask());
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.vtj-muutosrajapinta.fetch-enabled", matchIfMissing = false)
    Task<Void> vtjMuutostietoFetchTask() {
        return Tasks
                .recurring(TaskDescriptor.of("vtj muutostieto fetch task"), FixedDelay.ofHours(1))
                .execute((instance, ctx) -> vtjMuutostietoService.handleMuutostietoFetchTask());
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.vtj-muutosrajapinta.muutostieto-enabled", matchIfMissing = false)
    Task<Void> vtjMuutostietoSyncTask() {
        return Tasks
                .recurring(TaskDescriptor.of("vtj muutostieto task"), FixedDelay.ofHours(1))
                .execute((instance, ctx) -> vtjMuutostietoService.handleMuutostietoTask());
    }

    @Bean
    Task<Void> deathCleanupTask() {
        return Tasks
                .recurring(TaskDescriptor.of("DeathCleanupTask"),
                        new Daily(LocalTime.of(properties.getScheduling().getDeathCleanup().getHour(),
                                properties.getScheduling().getDeathCleanup().getMinute())))
                .execute((instance, ctx) -> cleanupService.run());
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.tasks.export.enabled", matchIfMissing = false)
    Task<Void> exportTask() {
        log.info("Creating oppijanumerorekisteri export task");
        return Tasks.recurring(TaskDescriptor.of("Export"), FixedDelay.ofHours(1))
                .execute((taskInstance, executionContext) -> {
                    try {
                        log.info("Running oppijanumerorekisteri export task");
                        exportService.createSchema();
                        exportService.generateExportFiles();
                        if (properties.getTasks().getExport().getCopyToLampi()) {
                            exportService.copyExportFilesToLampi();
                        } else {
                            log.info("Copying export files to Lampi is disabled");
                        }
                        log.info("Oppijanumerorekisteri export task completed");
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.tasks.datantuonti.export.enabled", matchIfMissing = false)
    Task<Void> datantuontiExportTask() {
        log.info("Creating datantuonti export task");
        return Tasks.recurring(TaskDescriptor.of("DatantuontiExport"), new Daily(LocalTime.of(0, 15, 0)))
                .execute((taskInstance, executionContext) -> {
                    try {
                        log.info("Running oppijanumerorekisteri datantuonti export task");
                        datantuontiExportService.createSchema();
                        datantuontiExportService.generateExportFiles();
                        log.info("Oppijanumerorekisteri datantuonti export task completed");
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.tasks.datantuonti.import.enabled", matchIfMissing = false)
    Task<Void> datantuontiImportTask() {
        log.info("Creating datantuonti import task");
        return Tasks.recurring(TaskDescriptor.of("DatantuontiImport"), new Daily(LocalTime.of(2, 15, 0)))
                .execute((taskInstance, executionContext) -> {
                    try {
                        log.info("Running oppijanumerorekisteri datantuonti import task");
                        datantuontiImportService.importTempTableFromS3();
                        datantuontiImportService.createNewHenkilos();
                        log.info("Oppijanumerorekisteri datantuonti import task completed");
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
    }

    @Bean
    @ConditionalOnProperty(name = "oppijanumerorekisteri.tasks.testidatantuonti.import.enabled", matchIfMissing = false)
    Task<Void> testidatantuontiImportTask() {
        log.info("Creating testidatantuonti import task");
        return Tasks.recurring(TaskDescriptor.of("TestidatantuontiImport"), new Daily(LocalTime.of(2, 10)))
                .execute((taskInstance, executionContext) -> {
                    log.info("Running testidatantuonti import task");
                    testidatantuontiImportService.createNewHenkilos();
                    log.info("Testidatantuonti import task completed");
                });
    }

    @Bean
    Task<Void> emailRetryTask() {
        return Tasks
                .recurring(TaskDescriptor.of("EmailRetryTask"), FixedDelay.ofMinutes(5))
                .execute((instance, ctx) -> queueingEmailService.emailRetryTask());
    }

    @Bean
    Task<Void> vtjkyselyCertificationCheckTask() {
        return Tasks
                .recurring(TaskDescriptor.of("vtjkyselyCertificationCheck"), new Daily(LocalTime.of(10, 10)))
                .execute((instance, ctx) -> vtjKyselyCertificationCheck.checkCertificationValidity());
    }
}
