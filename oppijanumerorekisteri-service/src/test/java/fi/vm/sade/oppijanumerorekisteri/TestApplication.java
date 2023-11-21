package fi.vm.sade.oppijanumerorekisteri;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;

import static org.mockito.Mockito.mock;

@Configuration
public class TestApplication {
    @Bean
    public JdbcIndexedSessionRepository jdbcIndexedSessionRepository() {
        return mock(JdbcIndexedSessionRepository.class);
    }
}
