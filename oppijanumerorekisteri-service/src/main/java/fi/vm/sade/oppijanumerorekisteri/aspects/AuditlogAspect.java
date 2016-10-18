package fi.vm.sade.oppijanumerorekisteri.aspects;

import fi.vm.sade.auditlog.Audit;
import fi.vm.sade.auditlog.oppijanumerorekisteri.LogMessage;
import fi.vm.sade.auditlog.oppijanumerorekisteri.OppijanumerorekisteriOperation;
import fi.vm.sade.oppijanumerorekisteri.configurations.AuditlogConfiguration;
import fi.vm.sade.oppijanumerorekisteri.utils.UserDetailsUtil;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static fi.vm.sade.auditlog.oppijanumerorekisteri.LogMessage.builder;

@Aspect
@Component
public class AuditlogAspect {
    private final Audit audit;

    @Autowired
    public AuditlogAspect(AuditlogConfiguration auditlogConfiguration) {
        this.audit = auditlogConfiguration.audit();
    }

    // Simple general advice.
    @Around("execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloService.*(..))")
    private Object oppijanumerorekisteriBusinessAdvice(ProceedingJoinPoint joinPoint) throws Throwable {
        // Make sure user has oid to log before running the method.
        String oid = UserDetailsUtil.getCurrentUserOid();
        Object result = joinPoint.proceed();
        if(result instanceof Boolean) {
            LogMessage logMessage = builder().userOid(oid).setOperaatio(OppijanumerorekisteriOperation.CHECK_HETU).build();
            audit.log(logMessage);
        }
        return result;
    }
}
