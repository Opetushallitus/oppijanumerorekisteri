package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.oppijanumerorekisteri.configurations.security.JdbcSessionMappingStorage;
import fi.vm.sade.oppijanumerorekisteri.configurations.security.OphSessionMappingStorage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.transaction.support.TransactionOperations;

@Configuration
@Slf4j
public class SessionMappingStorageConfiguration {
    @Bean
    @ConditionalOnProperty(name = "feature.disable-spring-session-transactions", havingValue = "true", matchIfMissing = false)
    public JdbcIndexedSessionRepository sessionRepository(JdbcTemplate jdbcTemplate) {
        log.info("Creating JdbcIndexedSessionRepository without transaction support");
        return new JdbcIndexedSessionRepository(jdbcTemplate, TransactionOperations.withoutTransaction());
    }

    @Bean
    @ConditionalOnProperty(name = "feature.disable-spring-session-transactions", havingValue = "false", matchIfMissing = true)
    public JdbcIndexedSessionRepository sessionRepositoryWithTransaction(JdbcTemplate jdbcTemplate, TransactionOperations transactionOperations) {
        log.info("Creating JdbcIndexedSessionRepository with transaction support");
        return new JdbcIndexedSessionRepository(jdbcTemplate, transactionOperations);
    }

    @Bean
    public OphSessionMappingStorage sessionMappingStorage(JdbcTemplate jdbcTemplate, JdbcIndexedSessionRepository sessionRepository) {
        return new JdbcSessionMappingStorage(jdbcTemplate, sessionRepository);
    }
}
