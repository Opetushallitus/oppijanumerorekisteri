package fi.vm.sade.henkiloui.configurations.properties;

import fi.vm.sade.properties.OphProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

@Configuration
public class UrlConfiguration extends OphProperties {

    @Autowired
    public UrlConfiguration(Environment environment) {
        addFiles("/henkiloui-service-oph.properties");
        addOverride("host-cas", environment.getRequiredProperty("host.host-cas"));
        addOverride("host-virkailija", environment.getRequiredProperty("host.host-virkailija"));
        if(!StringUtils.isEmpty(environment.getProperty("front.lokalisointi.baseUrl"))) {
            frontProperties.put("lokalisointi.baseUrl", environment.getProperty("front.lokalisointi.baseUrl"));
        }
        if(!StringUtils.isEmpty(environment.getProperty("front.organisaatio.baseUrl"))) {
            frontProperties.put("organisaatio-service.baseUrl", environment.getProperty("front.organisaatio.baseUrl"));
        }
        if(!StringUtils.isEmpty(environment.getProperty("front.koodisto.baseUrl"))) {
            frontProperties.put("koodisto-service.baseUrl", environment.getProperty("front.koodisto.baseUrl"));
        }
    }
}
