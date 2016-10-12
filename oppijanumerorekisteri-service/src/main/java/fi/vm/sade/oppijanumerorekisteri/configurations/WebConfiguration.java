package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class WebConfiguration extends WebMvcConfigurerAdapter{
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Disable extensions causing trouble when OID is provided at the end of rest API.
        configurer.setUseRegisteredSuffixPatternMatch(true);
    }
}
