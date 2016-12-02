package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.embedded.ConfigurableEmbeddedServletContainer;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.boot.context.embedded.tomcat.TomcatConnectorCustomizer;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Servlet containeriin liittyvät konfiguraatiot.
 */
@Configuration
public class ServletContainerConfiguration {

    /**
     * Konfiguraatio kun palvelua ajetaan HTTPS proxyn läpi. Käytännössä tämä
     * muuttaa {@link javax.servlet.ServletRequest#getScheme()} palauttamaan
     * `https` jolloin palvelun kautta luodut urlit muodostuvat oikein.
     *
     * Aktivointi: `oppijanumerorekisteri.uses-ssl-proxy` arvoon `true`.
     *
     * @return EmbeddedServletContainerCustomizer jonka Spring automaattisesti
     * tunnistaa ja lisää servlet containerin konfigurointiin
     */
    @Bean
    @ConditionalOnProperty("oppijanumerorekisteri.uses-ssl-proxy")
    public EmbeddedServletContainerCustomizer sslProxyCustomizer() {
        return (ConfigurableEmbeddedServletContainer container) -> {
            if (container instanceof TomcatEmbeddedServletContainerFactory) {
                TomcatEmbeddedServletContainerFactory tomcat = (TomcatEmbeddedServletContainerFactory) container;
                tomcat.addConnectorCustomizers((TomcatConnectorCustomizer) (Connector connector) -> {
                    connector.setScheme("https");
                    connector.setSecure(true);
                });
            }
        };
    }

}
