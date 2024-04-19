package fi.vm.sade.oppijanumerorekisteri.filter;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@Order(1) // works in conjunction with AuditLogReadFilter, must come first
public class CachingBodyFilter extends AuditLogFilter {
    public CachingBodyFilter(@Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping reqMap) {
        super(reqMap);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
        filterChain.doFilter(request, responseWrapper);
        responseWrapper.copyBodyToResponse();
    }
}
