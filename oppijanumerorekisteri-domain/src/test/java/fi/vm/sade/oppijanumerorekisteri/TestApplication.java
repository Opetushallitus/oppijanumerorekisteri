package fi.vm.sade.oppijanumerorekisteri;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestEntityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.jta.JtaTransactionManager;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import javax.sql.DataSource;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.util.Map;


@SpringBootApplication
public class TestApplication {
    @Configuration
    public abstract class HibernateConfig implements AutoConfigureTestEntityManager {

    }


    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
