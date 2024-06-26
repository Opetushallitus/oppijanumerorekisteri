package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
      registry.addViewController("/swagger-ui/")
          .setViewName("forward:/swagger-ui/index.html");
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new String2JodaDateTimeConverter());
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
      configurer.setUseTrailingSlashMatch(true);
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
