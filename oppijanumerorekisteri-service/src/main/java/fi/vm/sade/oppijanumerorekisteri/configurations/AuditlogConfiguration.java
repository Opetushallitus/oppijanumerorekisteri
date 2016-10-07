package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.auditlog.ApplicationType;
import fi.vm.sade.auditlog.Audit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuditlogConfiguration {
    @Bean
    public Audit audit() {
        return new Audit(ConfigEnums.SERVICENAME.value(), ApplicationType.BACKEND);
    }
}
