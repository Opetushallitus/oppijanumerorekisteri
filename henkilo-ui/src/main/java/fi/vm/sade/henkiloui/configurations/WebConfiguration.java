package fi.vm.sade.henkiloui.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/kayttaja/")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/kayttaja/{spring:\\w+}")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/kayttaja/**/{spring:\\w+}")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/")
                .setViewName("forward:/index.html");
        registry.addViewController("/{spring:\\w+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/**/{spring:\\w+}")
                .setViewName("forward:/index.html");
    }
}
