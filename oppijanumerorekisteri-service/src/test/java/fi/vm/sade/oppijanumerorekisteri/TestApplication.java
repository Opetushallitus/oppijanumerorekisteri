package fi.vm.sade.oppijanumerorekisteri;

//import fi.vm.sade.oppijanumerorekisteri.annotations.ExcludeFromTests;
import fi.vm.sade.oppijanumerorekisteri.configurations.db.JpaConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
//@ComponentScan(excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = ExcludeFromTests.class))
public class TestApplication {
//    @Configuration
//    public abstract class HibernateConfig implements AutoConfigureTestEntityManager {
//    }

    @Configuration
    @EnableJpaRepositories(basePackages = "fi.vm.sade.oppijanumerorekisteri.repositories")
    @PropertySource("application.yml")
    @EnableTransactionManagement
    public class H2JpaConfig {
        // ...
    }

    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
