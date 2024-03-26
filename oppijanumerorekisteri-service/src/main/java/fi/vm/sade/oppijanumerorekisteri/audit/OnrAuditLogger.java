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

import jakarta.servlet.http.HttpServletRequest;
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

        InetAddress address = getInetAddress(sra);
        if (address == null) {
            return null;
        }

        String session = "";
        String userAgent = "";
        if (sra != null) {
            HttpServletRequest req = sra.getRequest();
            session = req.getSession().getId();
            userAgent = req.getHeader("User-Agent");
        }

        return new User(getCurrentPersonOid(), address, session, userAgent);
    }

    private InetAddress getInetAddress(ServletRequestAttributes sra) {
        try {
            if (sra != null) {
                HttpServletRequest request = sra.getRequest();

                String realIp = request.getHeader("X-Real-IP");
                if (realIp != null) {
                    return InetAddress.getByName(realIp);
                }

                String forwardedFor = request.getHeader("X-Forwarded-For");
                if (forwardedFor != null) {
                    return InetAddress.getByName(forwardedFor);
                }
                log.warn("X-Real-IP or X-Forwarded-For was not set. Defaulting to Request.getRemoteAddr().");

                String remoteAddr = request.getRemoteAddr();
                if (remoteAddr != null) {
                    return InetAddress.getByName(remoteAddr);
                }
                log.warn("RemoteAddr was null. Defaulting to localhost/127.0.0.1.");
            }
            return InetAddress.getLocalHost();
        } catch (UnknownHostException e) {
            log.error("Error creating InetAddress: ", e);
            return null;
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
