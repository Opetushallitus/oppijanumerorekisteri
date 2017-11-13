package fi.vm.sade.oppijanumerorekisteri.audit;

import fi.vm.sade.auditlog.ApplicationType;
import org.springframework.stereotype.Component;

@Component
public class VirkailijaAuditLogger extends OnrAuditLogger {

    public VirkailijaAuditLogger() {
        super(new AuditHelper(), ApplicationType.VIRKAILIJA);
    }

}
