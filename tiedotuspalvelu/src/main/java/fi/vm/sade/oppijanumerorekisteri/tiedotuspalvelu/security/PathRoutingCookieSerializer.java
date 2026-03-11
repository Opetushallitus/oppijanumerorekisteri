package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PathRoutingCookieSerializer implements CookieSerializer {
  private final DefaultCookieSerializer oppija;
  private final DefaultCookieSerializer virkailija;
  private final DefaultCookieSerializer fallback;
  private final DefaultCookieSerializer fakes;

  public PathRoutingCookieSerializer() {
    this.oppija = new DefaultCookieSerializer();
    this.oppija.setCookieName("OPPIJA_SESSION");
    this.oppija.setCookiePath("/omat-viestit");

    this.virkailija = new DefaultCookieSerializer();
    this.virkailija.setCookieName("VIRKAILIJA_SESSION");
    this.virkailija.setCookiePath("/tiedotuspalvelu");

    this.fakes = new DefaultCookieSerializer();
    this.fakes.setCookieName("FAKES_SESSION");
    this.fakes.setCookiePath("/");

    this.fallback = new DefaultCookieSerializer();
    this.fallback.setCookieName("UNKNOWN_SESSION");
    this.fallback.setCookiePath("/");
  }

  @Override
  public List<String> readCookieValues(HttpServletRequest request) {
    return resolve(request).readCookieValues(request);
  }

  @Override
  public void writeCookieValue(CookieValue cookieValue) {
    resolve(cookieValue.getRequest()).writeCookieValue(cookieValue);
  }

  private DefaultCookieSerializer resolve(HttpServletRequest request) {
    var uri = request.getRequestURI();
    if (uri.startsWith("/omat-viestit")) {
      return oppija;
    }
    if (uri.startsWith("/tiedotuspalvelu")) {
      return virkailija;
    }
    if (uri.startsWith("/kayttooikeus-service")) {
      return fakes;
    }
    log.warn("Unexpected session cookie access from path: {}", uri);
    return fallback;
  }
}
