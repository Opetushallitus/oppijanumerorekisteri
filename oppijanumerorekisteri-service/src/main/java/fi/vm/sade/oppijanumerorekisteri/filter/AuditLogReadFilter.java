package fi.vm.sade.oppijanumerorekisteri.filter;

import com.jayway.jsonpath.JsonPath;
import fi.vm.sade.auditlog.Changes;
import fi.vm.sade.auditlog.Target;
import fi.vm.sade.oppijanumerorekisteri.audit.AuditMessageFields;
import fi.vm.sade.oppijanumerorekisteri.audit.OnrOperation;
import fi.vm.sade.oppijanumerorekisteri.audit.VirkailijaAuditLogger;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static java.util.stream.Collectors.joining;

@Component
@ComponentScan("fi.vm.sade.oppijanumerorekisteri.audit")
@Order(2) // works in conjunction with CachingBodyFilter, must come after it
public class AuditLogReadFilter extends AuditLogFilter {

    private final VirkailijaAuditLogger auditLogger;

    public AuditLogReadFilter(@Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping reqMap, VirkailijaAuditLogger auditLogger) {
        super(reqMap);
        this.auditLogger = auditLogger;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(request, response);

        if (response instanceof ContentCachingResponseWrapper) {
            String payload = new String(((ContentCachingResponseWrapper) response).getContentAsByteArray(), StandardCharsets.UTF_8);
            String jsonPath = getReadLogger(request).map(AuditLogRead::jsonPath).get();
            String oids = resolveOids(StringUtils.defaultIfEmpty(payload, "[]"), jsonPath);
            if (!oids.isEmpty()) {
                log(oids);
            }
        }
    }

    private void log(String oids) {
        auditLogger.log(
                OnrOperation.READ,
                new Target.Builder().setField(AuditMessageFields.OIDS, oids).build(),
                new Changes.Builder().build());
    }

    private String resolveOids(String payload, String jsonPath) {
        List<String> oids = JsonPath.read(payload, jsonPath);
        return oids.stream().collect(joining(","));
    }
}
