package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.oppijanumerorekisteri.filter.AuditLogReadFilter;
import fi.vm.sade.oppijanumerorekisteri.filter.CachingBodyFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.session.jdbc.JdbcOperationsSessionRepository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import static org.mockito.Mockito.mock;

@SpringBootApplication
public class TestApplication {

    @MockBean
    public AuditLogReadFilter auditLogReadFilter;
    @MockBean
    public CachingBodyFilter cachingBodyFilter;

    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }

    @Bean
    public JdbcOperationsSessionRepository jdbcOperationsSessionRepository() {
        return mock(JdbcOperationsSessionRepository.class);
    }

    @Configuration
    @EnableJpaRepositories(basePackages = "fi.vm.sade.oppijanumerorekisteri.repositories")
    @PropertySource("application.yml")
    @EnableTransactionManagement
    public class H2JpaConfig {

    }
}
