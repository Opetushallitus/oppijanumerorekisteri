package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;

@Configuration
public class SwaggerConfiguration {
    @Bean
    OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Oppijanumerorekisteri")
                .description("Oppijanumerorekisteri pitää sisällään henkilöiden tietoja"));
    }

    @Bean
    OpenApiCustomizer customerGlobalHeaderOpenApiCustomiser() {
        return openApi -> {
            openApi.getPaths().values().forEach(pathItem -> pathItem.readOperations().forEach(operation -> {
                ApiResponses apiResponses = operation.getResponses();
                apiResponses.addApiResponse("302",
                        new ApiResponse().description("Autentikaatio puuttuu (Redirect CAS login sivulle)"));
                apiResponses.addApiResponse("401",
                        new ApiResponse().description("Sessio on vanhentunut tai käyttöoikeudet ei riitä"));
            }));
        };
    }
}
