package fi.vm.sade.oppijanumerorekisteri.aspects;

import fi.vm.sade.auditlog.Audit;
import fi.vm.sade.auditlog.oppijanumerorekisteri.LogMessage;
import fi.vm.sade.auditlog.oppijanumerorekisteri.OppijanumerorekisteriOperation;
import fi.vm.sade.oppijanumerorekisteri.configurations.AuditlogConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
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

    void logHenkiloPerustietoDto(OppijanumerorekisteriOperation operation, HenkiloPerustietoDto henkiloPerustietoDto,
                                 Object returnHenkiloPerustietoDto) {
        LogMessage.LogMessageBuilder logMessage = builder()
                .setOperaatio(operation);
        if (returnHenkiloPerustietoDto instanceof HenkiloPerustietoDto) {
            logMessage.kohdehenkiloOid(((HenkiloPerustietoDto)returnHenkiloPerustietoDto).getOidHenkilo());
        }
        this.finishLogging(logMessage);
    }

    // Set the method calling user id and log.
    private void finishLogging(LogMessage.LogMessageBuilder builder) {
        Optional<String> oid = this.userDetailsHelper.findCurrentUserOid();
        LogMessage logMessage = builder.id(oid.orElse("No oid")).build();
        audit.log(logMessage);
    }
}
