package fi.vm.sade.oppijanumerorekisteri.aspects;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.auditlog.Changes;
import fi.vm.sade.auditlog.Target;
import fi.vm.sade.oppijanumerorekisteri.audit.*;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditlogAspectHelper {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final VirkailijaAuditLogger virkailijaLogger;

    void logCreateHenkilo(Henkilo henkilo, Object returnHenkilo) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkilo.getOidHenkilo())
                .setField(AuditMessageFields.LISATIETO, "Luotu uusi henkilö.")
                .build();
        Changes changes = new Changes.Builder()
                .added(AuditMessageFields.HENKILO, getJson(henkilo))
                .build();

        virkailijaLogger.log(OnrOperation.CREATE_HENKILO, target, changes);
    }

    void logUpdateHenkilo(HenkiloUpdateDto henkilo, Object returnHenkilo) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkilo.getOidHenkilo())
                .setField(AuditMessageFields.LISATIETO, "Muokattu olemassa olevaa henkilöä.")
                .build();
        Changes changes = new Changes.Builder()
                .updated(AuditMessageFields.HENKILO, "", getJson(henkilo))
                .build();
        virkailijaLogger.log(OnrOperation.UPDATE_HENKILO, target, changes);
    }

    void logForceUpdateHenkilo(HenkiloUpdateDto henkilo, Object returnHenkilo) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkilo.getOidHenkilo())
                .setField(AuditMessageFields.LISATIETO, "Muokattu väkisin olemassa olevaa henkilöä.")
                .build();
        Changes changes = new Changes.Builder()
                .updated(AuditMessageFields.HENKILO, "", getJson(henkilo))
                .build();
        virkailijaLogger.log(OnrOperation.FORCE_UPDATE_HENKILO, target, changes);
    }

    void logDisableHenkilo(String henkiloOid, Object returnHenkilo) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "Passivoidaan henkilö.")
                .build();
        Changes changes = new Changes.Builder()
                .updated(AuditMessageFields.PASSIVOITU, "false", "true")
                .build();
        virkailijaLogger.log(OnrOperation.PASSIVOI_HENKILO, target, changes);
    }

    void logCreateIdentification(String henkiloOid, IdentificationDto identification, Object returnIdentifications) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "Luotu henkilölle uusi tunnistetieto.")
                .build();
        Changes changes = new Changes.Builder()
                .updated(AuditMessageFields.TUNNISTETIETO, "", getJson(identification))
                .build();
        virkailijaLogger.log(OnrOperation.TUNNISTUSTIETOJEN_PAIVITYS, target, changes);
    }

    void logInitiateYksilointi(String henkiloOid, Object returnHenkilo) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "Aloitettu henkilon yksilointi.")
                .build();
        virkailijaLogger.log(OnrOperation.MANUAALINEN_YKSILOINTI, target, new Changes.Builder().build());
    }

    void logHetuttomanYksilointi(String henkiloOid, Object result) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "Yksilöidään hetuton henkilo.")
                .build();
        virkailijaLogger.log(OnrOperation.HETUTTOMAN_YKSILOINTI, target, new Changes.Builder().build());
    }

    void logPuraYksilointi(String henkiloOid, Object result) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "Puretaan hetuttoman henkilon yksilointi.")
                .build();
        virkailijaLogger.log(OnrOperation.PURA_HETUTTOMAN_YKSILOINTI, target, new Changes.Builder().build());
    }

    void logEnableYksilointi(String henkiloOid, String palvelutunniste, Object result) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "Yksilointi asetettu päälle.")
                .build();
        virkailijaLogger.log(OnrOperation.YKSILOINTI_PAALLE, target, new Changes.Builder().build());
    }

    void logDisableYksilointi(String henkiloOid, String palvelutunniste, Object result) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "Yksilointi asetettu pois päältä.")
                .build();
        virkailijaLogger.log(OnrOperation.YKSILOINTI_POIS_PAALTA, target, new Changes.Builder().build());
    }

    void logPaivitaYksilointitiedot(String henkiloOid) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.HENKILO_OID, henkiloOid)
                .setField(AuditMessageFields.LISATIETO, "VTJ-tiedot päivitetty.")
                .build();
        virkailijaLogger.log(OnrOperation.TUNNISTUSTIETOJEN_PAIVITYS, target, new Changes.Builder().build());
        virkailijaLogger.log(OnrOperation.YKSILOINTITIETOJEN_PAIVITYS, target, new Changes.Builder().build());
    }


    void logCreateTuonti(OppijaTuontiCreateDto dto) {
        Target target = new Target.Builder()
                .setField(AuditMessageFields.LISATIETO, "Oppijatuonti luotu.")
                .setField(AuditMessageFields.TUNNISTETIETO, dto.getSahkoposti()).build();
        virkailijaLogger.log(OnrOperation.OPPIJOIDEN_TUONTI, target, new Changes.Builder().build());
    }

    private String getJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            return String.format("Failed to parse json value: %s", extrapolateStackTrace(e));
        }
    }

    private String extrapolateStackTrace(Exception ex) {
        Throwable e = ex;
        StringBuilder trace = new StringBuilder();
        trace.append(e.toString()).append("\n");
        for (StackTraceElement e1 : e.getStackTrace()) {
            trace.append("\t at ").append(e1.toString()).append("\n");
        }
        while (e.getCause() != null) {
            e = e.getCause();
            trace.append("Cause by: ").append(e.toString()).append("\n");
            for (StackTraceElement e1 : e.getStackTrace()) {
                trace.append("\t at ").append(e1.toString()).append("\n");
            }
        }
        return trace.toString();
    }
}
