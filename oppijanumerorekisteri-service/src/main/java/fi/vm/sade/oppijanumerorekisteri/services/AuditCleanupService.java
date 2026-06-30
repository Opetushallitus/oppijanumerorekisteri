package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditCleanupService {

    static final List<String> AUDIT_TABLES = List.of(
            "henkilo_aud",
            "henkilo_huoltaja_suhde_aud",
            "henkilo_kansalaisuus_aud",
            "henkilo_organisaatio_aud",
            "henkilo_passinumero_aud");

    private final JdbcTemplate jdbcTemplate;
    private final OppijanumerorekisteriProperties properties;

    public void cleanup() {
        var config = properties.getTasks().getAuditCleanup();
        int retentionDays = config.getRetentionDays();
        int batchSize = config.getBatchSize();
        long cutoffMillis = Instant.now().minus(retentionDays, ChronoUnit.DAYS).toEpochMilli();
        Integer cutoffRev = jdbcTemplate.queryForObject(
                "SELECT MAX(rev) FROM revinfo WHERE revtstmp < ?", Integer.class, cutoffMillis);
        if (cutoffRev == null) {
            log.info("Audit cleanup: no revisions older than retentionDays={}", retentionDays);
            return;
        }
        log.info("Audit cleanup starting, retentionDays={}, cutoffRev={}, batchSize={}",
                retentionDays, cutoffRev, batchSize);

        for (String table : AUDIT_TABLES) {
            long deleted = deleteInBatches(table, cutoffRev, batchSize);
            log.info("Audit cleanup deleted {} rows from {}", deleted, table);
        }
        long revinfoDeleted = deleteInBatches("revinfo", cutoffRev, batchSize);
        log.info("Audit cleanup deleted {} orphan rows from revinfo", revinfoDeleted);
    }

    private long deleteInBatches(String table, int cutoffRev, int batchSize) {
        String sql = "DELETE FROM " + table
                + " WHERE ctid IN (SELECT ctid FROM " + table + " WHERE rev <= ? LIMIT ?)";
        long total = 0;
        int deleted;
        do {
            deleted = jdbcTemplate.update(sql, cutoffRev, batchSize);
            total += deleted;
            log.info("Audit cleanup deleted batch of {} rows from {} for a total of {}", deleted, table, total);
        } while (deleted == batchSize);

        return total;
    }
}
