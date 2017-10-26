package fi.vm.sade.oppijanumerorekisteri.configurations;

import java.util.Date;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
@ConditionalOnProperty(name = "oppijanumerorekisteri.swagger.enabled", matchIfMissing = true)
public class SwaggerConfiguration {
    @Bean
    public Docket henkiloApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .directModelSubstitute(Date.class, Integer.class) // unix time
                .useDefaultResponseMessages(false);
    }

    @Bean
    public ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("Oppijanumerorekisteri")
                .description("Oppijanumerorekisteri pitää sisällään henkilöiden tietoja")
                .build();

    }
}
