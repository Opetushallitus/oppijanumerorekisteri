package fi.vm.sade.oppijanumerorekisteri.aspects;

import fi.vm.sade.auditlog.Audit;
import fi.vm.sade.auditlog.oppijanumerorekisteri.LogMessage;
import fi.vm.sade.auditlog.oppijanumerorekisteri.OppijanumerorekisteriOperation;
import fi.vm.sade.oppijanumerorekisteri.configurations.AuditlogConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

import static fi.vm.sade.auditlog.oppijanumerorekisteri.LogMessage.builder;

@Component
public class AuditlogAspectHelper {
    private final Audit audit;
    private UserDetailsHelper userDetailsHelper;

    @Autowired
    public AuditlogAspectHelper(AuditlogConfiguration auditlogConfiguration, UserDetailsHelper userDetailsHelper) {
        this.audit = auditlogConfiguration.audit();
        this.userDetailsHelper = userDetailsHelper;
    }

    void logCreateHenkilo(Henkilo henkilo, Object returnHenkilo) {
        LogMessage.LogMessageBuilder logMessage = builder()
                .kohdehenkiloOid(henkilo.getOidHenkilo())
                .lisatieto("Luotu uusi henkilö.")
                .setOperaatio(OppijanumerorekisteriOperation.CREATE_HENKILO);
        finishLogging(logMessage);
    }

    void logUpdateHenkilo(HenkiloUpdateDto henkilo, Object returnHenkilo) {
        LogMessage.LogMessageBuilder logMessage = builder()
                .kohdehenkiloOid(henkilo.getOidHenkilo())
                .lisatieto("Muokattu olemassa olevaa henkilöä.")
                .setOperaatio(OppijanumerorekisteriOperation.UPDATE_HENKILO);
        finishLogging(logMessage);
    }

    void logDisableHenkilo(String henkiloOid, Object returnHenkilo) {
        LogMessage.LogMessageBuilder logMessage = builder()
                .kohdehenkiloOid(henkiloOid)
                .lisatieto("Passivoidaan henkilö.")
                .setOperaatio(OppijanumerorekisteriOperation.PASSIVOI_HENKILO);
        finishLogging(logMessage);
    }

    void logCreateIdentification(String henkiloOid, IdentificationDto identification, Object returnIdentifications) {
        LogMessage.LogMessageBuilder logMessage = builder()
                .kohdehenkiloOid(henkiloOid)
                .lisatieto("Luotu henkilölle uusi tunnistetieto.")
                .setOperaatio(OppijanumerorekisteriOperation.TUNNISTUSTIETOJEN_PAIVITYS);
        finishLogging(logMessage);
    }

    void logInitiateYksilointi(String henkiloOid, Object returnHenkilo) {
        LogMessage.LogMessageBuilder logMessage = builder()
                .kohdehenkiloOid(henkiloOid)
                .lisatieto("Aloitettu henkilon yksilointi.")
                .setOperaatio(OppijanumerorekisteriOperation.MANUAALINEN_YKSILOINTI);
        finishLogging(logMessage);
    }

    void logEnableYksilointi(String henkiloOid, String palvelutunniste, Object result) {
        LogMessage.LogMessageBuilder logMessage = builder()
                .kohdehenkiloOid(henkiloOid)
                .lisatieto("Yksilointi asetettu päälle.")
                .setOperaatio(OppijanumerorekisteriOperation.YKSILOINTI_PAALLE);
        finishLogging(logMessage);
    }

    void logDisableYksilointi(String henkiloOid, String palvelutunniste, Object result) {
        LogMessage.LogMessageBuilder logMessageBuilder = builder()
                .kohdehenkiloOid(henkiloOid)
                .lisatieto("Yksilointi asetettu pois päältä.")
                .setOperaatio(OppijanumerorekisteriOperation.YKSILOINTI_POIS_PAALTA);
    }

    void logPaivitaYksilointitiedot(String henkiloOid) {
        LogMessage.LogMessageBuilder logMessageBuilder1 = builder()
                .kohdehenkiloOid(henkiloOid)
                .lisatieto("VTJ-tiedot päivitetty")
                .setOperaatio(OppijanumerorekisteriOperation.TUNNISTUSTIETOJEN_PAIVITYS);
        finishLogging(logMessageBuilder1);
        LogMessage.LogMessageBuilder logMessageBuilder2 = builder()
                .kohdehenkiloOid(henkiloOid)
                .setOperaatio(OppijanumerorekisteriOperation.YKSILOINTITIETOJEN_PAIVITYS);
        finishLogging(logMessageBuilder2);
    }

    // Set the method calling user id and log.
    private void finishLogging(LogMessage.LogMessageBuilder builder) {
        Optional<String> oid = this.userDetailsHelper.findCurrentUserOid();
        LogMessage logMessage = builder.id(oid.orElse("No oid")).build();
        audit.log(logMessage);
    }
}
