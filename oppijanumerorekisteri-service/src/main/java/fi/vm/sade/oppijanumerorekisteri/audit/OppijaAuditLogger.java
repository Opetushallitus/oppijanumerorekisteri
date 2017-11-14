package fi.vm.sade.oppijanumerorekisteri.audit;

import fi.vm.sade.auditlog.ApplicationType;
import org.springframework.stereotype.Component;

@Component
public class OppijaAuditLogger extends OnrAuditLogger {

    public OppijaAuditLogger() {
        super(new OppijaAuditHelper(), ApplicationType.OPPIJA);
    }

}
