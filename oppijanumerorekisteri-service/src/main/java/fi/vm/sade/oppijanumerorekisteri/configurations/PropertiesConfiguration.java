package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = {
        "file:///${user.home:''}/oph-configuration/oppijanumerorekisteri-service.properties",
}, ignoreResourceNotFound = false)
public class PropertiesConfiguration {
}
