package fi.vm.sade.oppijanumerorekisteri.configurations.properties;

import fi.vm.sade.properties.OphProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class UrlConfiguration extends OphProperties {
    public UrlConfiguration(Environment environment) {
        addFiles("/oppijanumerorekisteri-service-oph.properties");
        addOverride("host-cas", environment.getRequiredProperty("host.host-cas"));
        addOverride("host-virkailija", environment.getRequiredProperty("host.host-virkailija"));
    }
}
