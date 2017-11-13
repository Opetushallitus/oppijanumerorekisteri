package fi.vm.sade.oppijanumerorekisteri.audit;

import fi.vm.sade.auditlog.ApplicationType;
import org.springframework.stereotype.Component;

@Component
public class ApiAuditLogger extends OnrAuditLogger {

    public ApiAuditLogger() {
        super(new AuditHelper(), ApplicationType.BACKEND);
    }

}
