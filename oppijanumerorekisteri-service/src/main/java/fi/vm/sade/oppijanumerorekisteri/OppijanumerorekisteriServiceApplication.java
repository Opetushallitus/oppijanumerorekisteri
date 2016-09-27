package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.oppijanumerorekisteri.configurations.PropertiesConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication
public class OppijanumerorekisteriServiceApplication {

	@Autowired
	void setPropertiesConfiguration(PropertiesConfiguration cp) {

	}

	public static void main(String[] args) {
		SpringApplication.run(OppijanumerorekisteriServiceApplication.class, args);
	}
}
