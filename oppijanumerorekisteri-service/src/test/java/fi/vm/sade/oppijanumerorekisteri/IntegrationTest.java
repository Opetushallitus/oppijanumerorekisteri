package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.oppijanumerorekisteri.configurations.CustomFilterConfiguration;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import org.springframework.boot.test.context.SpringBootTest;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(classes = {OppijanumerorekisteriServiceApplication.class, TestApplication.class, H2Configuration.class, CustomFilterConfiguration.class})
public @interface IntegrationTest {
}
