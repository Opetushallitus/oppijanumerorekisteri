package fi.vm.sade.henkiloui.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/kayttaja/*")
                 .setViewName("forward:/kayttaja.html");
        registry.addViewController("/kayttaja/**")
                 .setViewName("forward:/kayttaja.html");
        registry.addViewController("/{path:\\w+}")
                 .setViewName("forward:/main.html");
        registry.addViewController("/{path:!static}/**")
                 .setViewName("forward:/main.html");
    }
}
