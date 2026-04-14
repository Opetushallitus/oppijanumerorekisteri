package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.cfg.DateTimeFeature;

@Configuration
public class JacksonConfiguration {
    @Bean
    JsonMapperBuilderCustomizer customizer() {
        return builder -> builder
            .disable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
            .enable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
