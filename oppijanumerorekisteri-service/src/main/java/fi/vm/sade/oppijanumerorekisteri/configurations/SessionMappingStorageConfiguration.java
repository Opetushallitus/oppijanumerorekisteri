package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.oppijanumerorekisteri.configurations.security.JdbcSessionMappingStorage;
import fi.vm.sade.oppijanumerorekisteri.configurations.security.OphSessionMappingStorage;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.session.jdbc.JdbcOperationsSessionRepository;

@Configuration
public class SessionMappingStorageConfiguration {

    @Bean
    public OphSessionMappingStorage sessionMappingStorage(JdbcTemplate jdbcTemplate, JdbcOperationsSessionRepository sessionRepository) {
        return new JdbcSessionMappingStorage(jdbcTemplate, sessionRepository);
    }

}
