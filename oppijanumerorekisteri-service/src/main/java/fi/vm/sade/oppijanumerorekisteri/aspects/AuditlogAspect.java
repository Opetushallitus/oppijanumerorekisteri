package fi.vm.sade.oppijanumerorekisteri.aspects;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
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

    /* Henkilo */
    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService.createHenkilo(*))" +
            "&& args(henkilo)", argNames = "proceedingJoinPoint, henkilo")
    private Object logCreateHenkilo(ProceedingJoinPoint proceedingJoinPoint, Henkilo henkilo) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logCreateHenkilo(henkilo, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService.updateHenkilo(*))" +
            "&& args(henkilo)", argNames = "proceedingJoinPoint, henkilo")
    private Object logUpdateHenkilo(ProceedingJoinPoint proceedingJoinPoint, HenkiloUpdateDto henkilo) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logUpdateHenkilo(henkilo, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService.forceUpdateHenkilo(*))" +
            "&& args(henkilo)", argNames = "proceedingJoinPoint, henkilo")
    private Object logForceUpdateHenkilo(ProceedingJoinPoint proceedingJoinPoint, HenkiloUpdateDto henkilo) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logForceUpdateHenkilo(henkilo, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService.disableHenkilo(*))" +
            "&& args(henkiloOid)", argNames = "proceedingJoinPoint, henkiloOid")
    private Object logDisableHenkilo(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logDisableHenkilo(henkiloOid, result);
        return result;
    }

    /* Identification */
    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.IdentificationService.create(*))" +
            "&& args(henkiloOid, identification)", argNames = "proceedingJoinPoint, henkiloOid, identification")
    private Object logCreateIdentification(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid, IdentificationDto identification) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logCreateIdentification(henkiloOid, identification, result);
        return result;
    }

    /* Yksilointi */
    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.YksilointiService.paivitaYksilointitiedot(*))" +
            "&& args(henkiloOid)", argNames = "proceedingJoinPoint, henkiloOid")
    private Object logPaivitaYksilointitiedot(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logPaivitaYksilointitiedot(henkiloOid);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.YksilointiService.yksiloiManuaalisesti(*))" +
            "&& args(henkiloOid)", argNames = "proceedingJoinPoint, henkiloOid")
    private Object logYksiloiManuaalisesti(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logInitiateYksilointi(henkiloOid, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.YksilointiService.hetuttomanYksilointi(*))" +
            "&& args(henkiloOid)", argNames = "proceedingJoinPoint, henkiloOid")
    private Object logHetuttomanYksilointi(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logHetuttomanYksilointi(henkiloOid, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.YksilointiService.puraHeikkoYksilointi(*))" +
    "&& args(henkiloOid)", argNames = "proceedingJoinPoint, henkiloOid")
    private Object logPuraHeikkoYksilointi(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logPuraYksilointi(henkiloOid, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.YksilointiService.enableYksilointi(*))" +
            "&& args(henkiloOid, palvelutunniste)", argNames = "proceedingJoinPoint, henkiloOid, palvelutunniste")
    private Object logEnableYksilointi(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid, String palvelutunniste) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logEnableYksilointi(henkiloOid, palvelutunniste, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.YksilointiService.disableYksilointi(*))" +
            "&& args(henkiloOid, palvelutunniste)", argNames = "proceedingJoinPoint, henkiloOid, palvelutunniste")
    private Object logDisableYksilointi(ProceedingJoinPoint proceedingJoinPoint, String henkiloOid, String palvelutunniste) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logDisableYksilointi(henkiloOid, palvelutunniste, result);
        return result;
    }

    @Around(value = "execution(public * fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService.create(fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto))" +
                    "&& args(dto)", argNames = "proceedingJoinPoint, dto")
    private Object logSaveTuonti(ProceedingJoinPoint proceedingJoinPoint, OppijaTuontiCreateDto dto) throws Throwable {
        Object result = proceedingJoinPoint.proceed();
        auditlogAspectHelper.logCreateTuonti(dto);
        return result;
    }
}
