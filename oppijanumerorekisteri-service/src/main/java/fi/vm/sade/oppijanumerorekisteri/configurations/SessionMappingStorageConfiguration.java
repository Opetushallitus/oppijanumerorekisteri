package fi.vm.sade.oppijanumerorekisteri.configurations;


import fi.vm.sade.oppijanumerorekisteri.LastAccessedTimeIgnoringJdbcIndexedSessionRepository;
import fi.vm.sade.oppijanumerorekisteri.configurations.security.JdbcSessionMappingStorage;
import fi.vm.sade.oppijanumerorekisteri.configurations.security.OphSessionMappingStorage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.session.config.annotation.web.http.EnableSpringHttpSession;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.transaction.support.TransactionOperations;

@Configuration
@Slf4j
public class SessionMappingStorageConfiguration {
    @Bean
    OphSessionMappingStorage sessionMappingStorage(JdbcTemplate jdbcTemplate, SessionRepository<? extends Session> sessionRepository) {
        return new JdbcSessionMappingStorage(jdbcTemplate, sessionRepository);
    }

    @Bean
    public SessionRepository<? extends Session> sessionRepository(JdbcOperations jdbcOperations, TransactionOperations transactionOperations) {
        log.info("Creating LastAccessedTimeIgnoringJdbcIndexedSessionRepository");
        return new LastAccessedTimeIgnoringJdbcIndexedSessionRepository(jdbcOperations, transactionOperations);
    }
}