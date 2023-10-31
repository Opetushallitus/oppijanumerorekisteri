package fi.vm.sade.henkiloui.configurations.properties;

import fi.vm.sade.properties.OphProperties;
import lombok.Getter;
import lombok.Setter;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Getter
@Setter
@Configuration
public class HenkiloUiProperties extends OphProperties {
    private final Environment environment;

    public HenkiloUiProperties(Environment environment) {
        this.environment = environment;
        addFiles("/henkiloui-service-oph.properties");
        addOverride("host-cas", environment.getRequiredProperty("host.host-cas"));
        addOverride("host-virkailija", environment.getRequiredProperty("host.host-virkailija"));
        addOverride("host-cas-oppija", environment.getRequiredProperty("host.host-cas-oppija"));
    }
}