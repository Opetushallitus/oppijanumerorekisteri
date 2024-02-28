package fi.vm.sade.henkiloui.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final String mainBundle = "forward:/main.html";
    private final String kayttajaBundle = "forward:/kayttaja.html";

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {

        registry.addViewController("/kayttaja/*")
                 .setViewName(kayttajaBundle);
        registry.addViewController("/kayttaja/**")
                 .setViewName(kayttajaBundle);

        // this does not forward paths with e.g. dots so things like favicon.ico (and indeed main.html) work
        registry.addViewController("/{path:\\w+}")
                 .setViewName(mainBundle);

        // explicit paths where a path may include an OID (the !static controller below does not catch these for some reason)
        registry.addViewController("/virkailija/**")
                 .setViewName(mainBundle);
        registry.addViewController("/oppija/**")
                 .setViewName(mainBundle);
        registry.addViewController("/admin/**")
                 .setViewName(mainBundle);

        // rest of the paths to non-static resources
        registry.addViewController("/")
                 .setViewName(mainBundle);
        registry.addViewController("/{path:!static}/**")
                 .setViewName(mainBundle);
    }
}
