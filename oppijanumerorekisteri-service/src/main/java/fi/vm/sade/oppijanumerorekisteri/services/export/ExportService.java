package fi.vm.sade.oppijanumerorekisteri.services.export;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class ExportService {
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void createSchema() {
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS exportnew CASCADE");
        jdbcTemplate.execute("CREATE SCHEMA exportnew");
        jdbcTemplate.execute("""
            CREATE TABLE exportnew.henkilo AS
            SELECT
              h.oidhenkilo AS oppija_oid,
              (
                  SELECT master_oid
                  FROM henkiloviite
                  WHERE slave_oid = h.oidhenkilo
                  LIMIT 1
              ) AS master_oid,
              (
                  SELECT string_agg(slave_oid, ',')
                  FROM henkiloviite
                  WHERE master_oid = h.oidhenkilo
                  LIMIT 1
              ) AS linkitetyt_oidit,
              h.hetu,
              h.sukupuoli,
              h.syntymaaika,
              h.sukunimi,
              h.etunimet,
              h.aidinkieli_id as aidinkieli,
              (
                  SELECT string_agg(cast (kansalaisuus_id as varchar), ',')
                  FROM henkilo_kansalaisuus
                  WHERE henkilo_id = h.id
              ) AS kansalaisuus,
              h.turvakielto,
              h.kotikunta,
              h.yksiloityvtj
            FROM henkilo h;
        """);
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS export CASCADE");
        jdbcTemplate.execute("ALTER SCHEMA exportnew RENAME TO export");
    }
}
