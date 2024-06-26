package fi.vm.sade.oppijanumerorekisteri.filter;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.util.ServletRequestPathUtils;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

public abstract class AuditLogFilter extends OncePerRequestFilter {

    private final RequestMappingHandlerMapping reqMap;

    protected AuditLogFilter(RequestMappingHandlerMapping reqMap) {
        this.reqMap = reqMap;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return getReadLogger(request).isEmpty();
    }

    protected Optional<AuditLogRead> getReadLogger(HttpServletRequest request) {
        return Optional.ofNullable(reqMap)
                .map(mapping -> {
                    try {
                        if (!ServletRequestPathUtils.hasParsedRequestPath(request)) {
                            ServletRequestPathUtils.parseAndCache(request);
                        }
                        return mapping.getHandler(request);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .map(chain -> (HandlerMethod) chain.getHandler())
                .map(HandlerMethod::getMethod)
                .map(method -> method.getAnnotation(AuditLogRead.class));
    }
}
