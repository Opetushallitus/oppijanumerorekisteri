package fi.vm.sade.oppijanumerorekisteri;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestEntityManager;

@SpringBootApplication
@AutoConfigureTestEntityManager
public class TestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
