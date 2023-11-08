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

        // this does not forward paths with e.g. dots so things like favicon.ico (and indeed main.html) work
        registry.addViewController("/{path:\\w+}")
                 .setViewName("forward:/main.html");

        // explicit paths where a path may include an OID (the !static controller below does not catch these for some reason)
        registry.addViewController("/virkailija/**")
                 .setViewName("forward:/main.html");
        registry.addViewController("/oppija/**")
                 .setViewName("forward:/main.html");
        registry.addViewController("/admin/**")
                 .setViewName("forward:/main.html");

        // rest of the paths to non-static resources
        registry.addViewController("/{path:!static}/**")
                 .setViewName("forward:/main.html");
    }
}
