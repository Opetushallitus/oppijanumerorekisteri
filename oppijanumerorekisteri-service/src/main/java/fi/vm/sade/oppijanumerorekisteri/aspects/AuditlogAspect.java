package fi.vm.sade.oppijanumerorekisteri.aspects;

import fi.vm.sade.auditlog.oppijanumerorekisteri.OppijanumerorekisteriOperation;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloKoskiDto;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Aspect
@Component
public class AuditlogAspect {
    private AuditlogAspectHelper auditlogAspectHelper;

    @Autowired
    public AuditlogAspect(AuditlogAspectHelper auditlogAspectHelper) {
        this.auditlogAspectHelper = auditlogAspectHelper;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloService.createHenkiloFromKoskiDto(*))" +
            "&& args(henkiloKoskiDto)", argNames = "proceedingJoinPoint, henkiloKoskiDto")
    private Object oppijanumerorekisteriBusinessAdvice(ProceedingJoinPoint proceedingJoinPoint, HenkiloKoskiDto henkiloKoskiDto)
            throws Throwable {
        Object result = null;
        try {
            result = proceedingJoinPoint.proceed();
        } finally {
            auditlogAspectHelper.logKoskiDto(OppijanumerorekisteriOperation.CREATE_KOSKI_HENKILO, henkiloKoskiDto, result);
        }
        return result;
    }
}
