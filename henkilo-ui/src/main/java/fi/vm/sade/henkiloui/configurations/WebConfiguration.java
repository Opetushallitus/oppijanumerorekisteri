package fi.vm.sade.henkiloui.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final String mainBundle = "forward:/main.html";
    private final String kayttajaBundle = "forward:/kayttaja.html";

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/kayttaja/**")
                 .setViewName(kayttajaBundle);

        registry.addViewController("/")
                 .setViewName(mainBundle);
        registry.addViewController("/{spring:\\w+}")
                 .setViewName(mainBundle);
        registry.addViewController("/{spring:(?!static)\\w+}/**")
                 .setViewName(mainBundle);
    }
}
