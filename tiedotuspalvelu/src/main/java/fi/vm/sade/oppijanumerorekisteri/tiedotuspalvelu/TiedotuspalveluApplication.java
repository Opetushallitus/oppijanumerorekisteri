package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(TiedotuspalveluProperties.class)
public class TiedotuspalveluApplication {
  public static void main(String[] args) {
    SpringApplication.run(TiedotuspalveluApplication.class, args);
  }
}
