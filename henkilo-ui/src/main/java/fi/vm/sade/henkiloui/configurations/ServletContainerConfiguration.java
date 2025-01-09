package fi.vm.sade.henkiloui.configurations;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

/**
 * Servlet containeriin liittyvät konfiguraatiot.
 */
@Configuration
public class ServletContainerConfiguration {

    /**
     * Konfiguraatio kun palvelua ajetaan HTTPS proxyn läpi. Käytännössä tämä
     * muuttaa {@link javax.servlet.ServletRequest#getScheme()} palauttamaan
     * `https` jolloin palvelun kautta luodut urlit muodostuvat oikein.
     * <p>
     * Aktivointi: `kayttooikeus.uses-ssl-proxy` arvoon `true`.
     *
     * @return EmbeddedServletContainerCustomizer jonka Spring automaattisesti
     * tunnistaa ja lisää servlet containerin konfigurointiin
     */
    @Bean
    @ConditionalOnProperty("henkiloui.uses-ssl-proxy")
    WebServerFactoryCustomizer<TomcatServletWebServerFactory> sslProxyCustomizer() {
        return container -> {
            container.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND, "/"));
            container.addConnectorCustomizers((Connector connector) -> {
                connector.setScheme("https");
                connector.setSecure(true);
            });
        };
    }
}
