package fi.vm.sade.oppijanumerorekisteri.audit;

import fi.vm.sade.auditlog.Logger;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class OppijaAuditHelper implements Logger {

    @Override
    public void log(String msg) {
        log.info(msg);
    }

}
