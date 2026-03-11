package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addViewController("/omat-viestit/").setViewName("forward:/omat-viestit/index.html");
    registry
        .addViewController("/tiedotuspalvelu/")
        .setViewName("forward:/tiedotuspalvelu/index.html");
  }

  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler("/omat-viestit/**")
        .addResourceLocations("classpath:static/web-build/omat-viestit/");
    registry
        .addResourceHandler("/tiedotuspalvelu/**")
        .addResourceLocations("classpath:static/web-build/tiedotuspalvelu/");
  }
}
