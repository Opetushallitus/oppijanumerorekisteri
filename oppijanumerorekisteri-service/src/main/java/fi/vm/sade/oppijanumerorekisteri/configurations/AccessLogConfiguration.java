package fi.vm.sade.oppijanumerorekisteri.configurations;

import ch.qos.logback.access.tomcat.LogbackValve;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.embedded.tomcat.TomcatContextCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AccessLogConfiguration {

    @Bean
    @ConditionalOnProperty(name = "logback.access")
    WebServerFactoryCustomizer<WebServerFactory> containerCustomizer() {
        return container -> {
            if (container instanceof TomcatServletWebServerFactory) {
                ((TomcatServletWebServerFactory) container).addContextCustomizers((TomcatContextCustomizer) context -> {
                    LogbackValve logbackValve = new LogbackValve();
                    logbackValve.setFilename("logback-access.xml");
                    context.getPipeline().addValve(logbackValve);
                });
            }
        };

    }
}
