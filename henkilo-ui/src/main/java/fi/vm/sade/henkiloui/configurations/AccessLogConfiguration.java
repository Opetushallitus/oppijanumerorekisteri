package fi.vm.sade.henkiloui.configurations;

import ch.qos.logback.access.tomcat.LogbackValve;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

@Configuration
public class AccessLogConfiguration {

    @Bean
    WebServerFactoryCustomizer<TomcatServletWebServerFactory> containerCustomizer() {
        return container -> {
            container.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND, "/"));
            container.addContextCustomizers(context -> {
                LogbackValve logbackValve = new LogbackValve();
                logbackValve.setFilename("logback-access.xml");
                context.getPipeline().addValve(logbackValve);
            });
        };
    }
}
