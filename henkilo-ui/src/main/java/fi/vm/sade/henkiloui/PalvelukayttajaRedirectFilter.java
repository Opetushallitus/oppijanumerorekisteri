package fi.vm.sade.henkiloui;

import fi.vm.sade.henkiloui.configurations.security.CasUserDetailsService;
import fi.vm.sade.henkiloui.configurations.security.SecurityConfiguration;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.cas.authentication.CasAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.net.URI;

@Component
@Slf4j
public class PalvelukayttajaRedirectFilter extends GenericFilterBean {
    @Value("${host.host-virkailija}")
    private String hostVirkailija;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        if (servletRequest instanceof HttpServletRequest request && servletResponse instanceof HttpServletResponse response && !isAllowedRequestForPalvelukayttaja(request)) {
            var principal = request.getUserPrincipal();
            if (principal instanceof CasAuthenticationToken token) {
                var userDetails = token.getUserDetails();
                if (userDetails instanceof CasUserDetailsService.CasUserDetails casUserDetails && (casUserDetails.isPalvelukayttaja())) {
                    log.info("Redirecting palvelukäyttäjä '{}' to Swagger", casUserDetails.getUsername());
                    response.sendRedirect(hostVirkailija + "/oppijanumerorekisteri-service/swagger-ui/");
                    return;
                }

            }
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }

    private boolean isAllowedRequestForPalvelukayttaja(HttpServletRequest request) {
        var uri = URI.create(request.getRequestURI());
        return isStaticAssetRequest(uri) || isPalvelukayttajaInfoRequest(uri) || isCasAuthRequest(uri);
    }

    private boolean isStaticAssetRequest(URI uri) {
        return "/henkilo-ui/favicon.ico".equals(uri.getPath()) || uri.getPath().startsWith("/henkilo-ui/static");
    }

    private boolean isPalvelukayttajaInfoRequest(URI uri) {
        return "/henkilo-ui/palvelukayttajainfo".equals(uri.getPath());
    }

    private boolean isCasAuthRequest(URI uri) {
        return uri.getPath().endsWith(SecurityConfiguration.SPRING_CAS_SECURITY_CHECK_PATH);
    }
}
