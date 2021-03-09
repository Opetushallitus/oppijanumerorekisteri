package fi.vm.sade.henkiloui.configurations.properties;

import fi.vm.sade.properties.OphProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

@Configuration
public class UrlConfiguration extends OphProperties {
    private Environment environment;

    @Autowired
    public UrlConfiguration(Environment environment) {
        this.environment = environment;
        addFiles("/henkiloui-service-oph.properties");
        addOverride("host-cas", environment.getRequiredProperty("host.host-cas"));
        addOverride("host-virkailija", environment.getRequiredProperty("host.host-virkailija"));
        addOverride("host-cas-oppija", environment.getRequiredProperty("host.host-cas-oppija"));
        // Required
        this.frontProperties.put("cas-oppija.baseUrl", environment.getRequiredProperty("host.host-cas-oppija"));
        // Optional, default to localhost
        this.addUrlIfConfigured("front.lokalisointi.baseUrl", "lokalisointi.baseUrl");
        this.addUrlIfConfigured("front.koodisto.baseUrl", "koodisto-service.baseUrl");
        this.addUrlIfConfigured("front.kayttooikeus.baseUrl", "kayttooikeus-service.baseUrl");
        this.addUrlIfConfigured("front.oppijanumerorekisteri.baseUrl", "oppijanumerorekisteri-service.baseUrl");
        this.addUrlIfConfigured("front.cas.baseUrl", "cas.baseUrl");
        this.addUrlIfConfigured("front.virkailija-raamit.baseUrl", "virkailija-raamit.baseUrl");
    }

    private void addUrlIfConfigured(String configFilePath, String frontPropertyPath) {
        String environmentProperty = this.environment.getProperty(configFilePath);
        if (!StringUtils.isEmpty(environmentProperty)) {
            this.frontProperties.put(frontPropertyPath, environmentProperty);
        }
    }
}
