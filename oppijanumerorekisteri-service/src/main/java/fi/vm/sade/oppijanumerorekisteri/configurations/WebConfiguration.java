package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.env.Environment;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import java.util.Arrays;

@Configuration
public class WebConfiguration extends WebMvcConfigurerAdapter{
    private final Environment environment;

    @Autowired
    public WebConfiguration(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if(Arrays.stream(this.environment.getActiveProfiles()).anyMatch(s -> s.equals("dev") || s.equals("luokka"))) {
            registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:8280");
        }
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Disable extensions causing trouble when OID is provided at the end of rest API.
        configurer.setUseRegisteredSuffixPatternMatch(true);
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new String2JodaDateTimeConverter());
    }
    
    /*
     * Parse DateTime from 
     * 1. Standard ISO string
     * 2. Standard date ISO string (treated as beginning of day)
     * 3. Unix timestamp
     */
    public static class String2JodaDateTimeConverter implements Converter<String, DateTime> {
        @Override
        public DateTime convert(String str) {
            if (str == null || str.isEmpty()) {
                return null;
            }
            try {
                return DateTime.parse(str);
            } catch (IllegalArgumentException e) {
                try {
                    // Try parsing date format (and thread as begin of day:
                    return LocalDate.parse(str).toDateTimeAtStartOfDay();
                } catch (IllegalArgumentException e2) {
                    try {
                        return new DateTime(Long.parseLong(str));
                    } catch (IllegalArgumentException e3) {
                        throw e;
                    }
                }
            }
        }
    }
}
