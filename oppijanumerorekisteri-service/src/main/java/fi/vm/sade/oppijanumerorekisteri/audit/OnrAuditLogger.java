package fi.vm.sade.oppijanumerorekisteri.audit;

import fi.vm.sade.auditlog.*;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import lombok.extern.slf4j.Slf4j;
import org.ietf.jgss.GSSException;
import org.ietf.jgss.Oid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

@Slf4j
public class OnrAuditLogger extends Audit {

    OnrAuditLogger(Logger logger, ApplicationType applicationType) {
        super(logger, ConfigEnums.SERVICENAME.value(), applicationType);
    }

    public void log(Operation operation, Target target, Changes changes) {
        log(getUser(), operation, target, changes);
    }

    private User getUser() {
        ServletRequestAttributes sra = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if(sra != null) {
            HttpServletRequest req = sra.getRequest();
            String sessionId = req.getSession().getId();
            String useragent = req.getHeader("User-Agent");
            String remoteAddr = req.getRemoteAddr();

            try {
                InetAddress address = InetAddress.getByName(remoteAddr);
                return new User(getCurrentPersonOid(), address, sessionId, useragent);
            } catch (UnknownHostException e) {
                log.error("Error creating inetadress for user out of {}, returning null user", remoteAddr, e);
                return null;
            }
        } else {
            try {
                return new User(getCurrentPersonOid(), InetAddress.getLocalHost(), "", "");
            } catch (UnknownHostException e) {
                log.error("Error creating localhost inetaddress",e);
                return null;
            }
        }
    }

    private Oid getCurrentPersonOid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            try {
                return new Oid(authentication.getName());
            } catch (GSSException e) {
                log.error("Error creating Oid-object out of {}", authentication.getName());
            }
        }
        return null;
    }
}
