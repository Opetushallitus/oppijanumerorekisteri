package fi.vm.sade.oppijanumerorekisteri;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestEntityManager;
import org.springframework.context.annotation.Configuration;

@SpringBootApplication
public class TestApplication {
    @Configuration
    public abstract class HibernateConfig implements AutoConfigureTestEntityManager {
    }
    
    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
