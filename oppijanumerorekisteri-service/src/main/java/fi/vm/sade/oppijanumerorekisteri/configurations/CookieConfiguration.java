package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

/**
 * Meant to disable SameSite cookie attribute for cross site development on test environments. Otherwise cookies
 * are not set causing infinite cas login loop.
 * Not enabled by default.
 */
@Configuration
public class CookieConfiguration {

    @ConditionalOnProperty("oppijanumerorekisteri.disable-same-site-cookie")
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer defaultCookieSerializer = new DefaultCookieSerializer();
        defaultCookieSerializer.setSameSite(null);
        defaultCookieSerializer.setCookieName("JSESSIONID");
        defaultCookieSerializer.setUseSecureCookie(true);
        return defaultCookieSerializer;
    }
}
