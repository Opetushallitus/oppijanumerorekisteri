package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.logging;

import jakarta.servlet.*;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestIdFilter implements Filter {
  public static final String REQUEST_ID_ATTRIBUTE = RequestIdFilter.class.getName() + ".requestId";

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    try {
      var requestId = generateRequestId();
      MDC.put(REQUEST_ID_ATTRIBUTE, requestId);
      request.setAttribute(REQUEST_ID_ATTRIBUTE, requestId);
      chain.doFilter(request, response);
    } finally {
      MDC.remove(REQUEST_ID_ATTRIBUTE);
    }
  }

  public static String generateRequestId() {
    return java.util.UUID.randomUUID().toString();
  }
}
