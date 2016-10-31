package fi.vm.sade.oppijanumerorekisteri.aspects;

import fi.vm.sade.auditlog.Audit;
import fi.vm.sade.auditlog.oppijanumerorekisteri.LogMessage;
import fi.vm.sade.auditlog.oppijanumerorekisteri.OppijanumerorekisteriOperation;
import fi.vm.sade.oppijanumerorekisteri.configurations.AuditlogConfiguration;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

import static fi.vm.sade.auditlog.oppijanumerorekisteri.LogMessage.builder;

@Aspect
@Component
public class AuditlogAspect {
    private final Audit audit;
    private UserDetailsHelper userDetailsHelper;

    @Autowired
    public AuditlogAspect(AuditlogConfiguration auditlogConfiguration, UserDetailsHelper userDetailsHelper) {
        this.audit = auditlogConfiguration.audit();
        this.userDetailsHelper = userDetailsHelper;
    }

    @AfterThrowing("execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloService.*(..))")
    private void logAfterException() {
        Optional<String> oid = this.userDetailsHelper.getCurrentUserOid();
        LogMessage logMessage = builder().userOid(oid.get()).setOperaatio(OppijanumerorekisteriOperation.CHECK_HETU).build();
        audit.log(logMessage);
    }

    // Simple general advice.
    @AfterReturning(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloService.*(..))",
            returning = "retVal")
    private Object oppijanumerorekisteriBusinessAdvice(Object retVal) throws Throwable {
        // Make sure user has oid to log before running the method.
        Optional<String> oid = this.userDetailsHelper.getCurrentUserOid();
        if(retVal instanceof Boolean) {
            LogMessage logMessage = builder().userOid(oid.get()).setOperaatio(OppijanumerorekisteriOperation.CHECK_HETU).build();
            audit.log(logMessage);
        }
        return retVal;
    }
}
