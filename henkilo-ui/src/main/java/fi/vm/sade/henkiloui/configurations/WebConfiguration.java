package fi.vm.sade.henkiloui.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/kayttaja/rekisteroidy**")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/kayttaja/salasananvaihto/**")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/kayttaja/sahkopostivarmistus/**")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/kayttaja/vahvatunnistusinfo/**")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/kayttaja/uudelleenrekisterointi/**")
                .setViewName("forward:/kayttaja/index.html");
        registry.addViewController("/{spring:!kayttaja}**")
                .setViewName("forward:/index.html");
    }
}
