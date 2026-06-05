package fi.vm.sade;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.cas.authentication.CasAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.GenericFilterBean;

import fi.vm.sade.oppijanumerorekisteri.configurations.security.cas.OpintopolkuUserDetailsService;

import java.io.IOException;
import java.util.Optional;
import java.util.function.Consumer;

@Slf4j
public class RequestCallerFilter extends GenericFilterBean {
    public static final String CALLER_HENKILO_OID_ATTRIBUTE = RequestCallerFilter.class.getName() + ".callerHenkiloOid";
    public static final String PROTOCOL_ATTRIBUTE = RequestCallerFilter.class.getName() + ".protocol";

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        try {
            getJwtToken(servletRequest).ifPresentOrElse(
                    setOauthAttributes(servletRequest),
                    setCasAttributes(servletRequest));
            filterChain.doFilter(servletRequest, servletResponse);
        } finally {
            MDC.remove(CALLER_HENKILO_OID_ATTRIBUTE);
        }
    }

    private Runnable setCasAttributes(ServletRequest servletRequest) {
        return () -> getUserDetails(servletRequest).ifPresent(userDetails -> {
            setCallerOid(servletRequest, userDetails.getUsername());
            servletRequest.setAttribute(PROTOCOL_ATTRIBUTE, "cas");
        });
    }

    private Consumer<JwtAuthenticationToken> setOauthAttributes(ServletRequest servletRequest) {
        return token -> {
            setCallerOid(servletRequest, token.getToken().getSubject());
            servletRequest.setAttribute(PROTOCOL_ATTRIBUTE, "oauth");
        };
    }

    private void setCallerOid(ServletRequest servletRequest, String oid) {
        MDC.put(CALLER_HENKILO_OID_ATTRIBUTE, oid);
        servletRequest.setAttribute(CALLER_HENKILO_OID_ATTRIBUTE, oid);
    }

    private Optional<JwtAuthenticationToken> getJwtToken(ServletRequest servletRequest) {
        if (servletRequest instanceof HttpServletRequest request) {
            if (request.getUserPrincipal() instanceof JwtAuthenticationToken token) {
                return Optional.of(token);
            }
        }
        return Optional.empty();
    }

    private Optional<OpintopolkuUserDetailsService.UserDetailsImpl> getUserDetails(ServletRequest servletRequest) {
        if (servletRequest instanceof HttpServletRequest request) {
            if (request.getUserPrincipal() instanceof CasAuthenticationToken token) {
                if (token.getUserDetails() instanceof OpintopolkuUserDetailsService.UserDetailsImpl casUserDetails) {
                    return Optional.of(casUserDetails);
                }
            }
        }
        return Optional.empty();
    }
}
