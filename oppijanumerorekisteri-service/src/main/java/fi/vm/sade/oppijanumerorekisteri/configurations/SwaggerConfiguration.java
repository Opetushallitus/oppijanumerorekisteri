package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.mvc.condition.PathPatternsRequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.RequestMappingInfoHandlerMapping;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.RequestHandlerProvider;
import springfox.documentation.spring.web.WebMvcRequestHandler;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper;
import springfox.documentation.spring.web.plugins.WebMvcRequestHandlerProvider;
import springfox.documentation.spring.web.readers.operation.HandlerMethodResolver;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import javax.servlet.ServletContext;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static java.util.stream.Collectors.toList;
import static springfox.documentation.spi.service.contexts.Orderings.byPatternsCondition;
import static springfox.documentation.spring.web.paths.Paths.ROOT;

@Configuration
@EnableSwagger2
public class SwaggerConfiguration {
    @Bean
    public Docket henkiloApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .directModelSubstitute(Date.class, Integer.class) // unix time
                .directModelSubstitute(Object.class, java.lang.Void.class) // 204 empty
                .useDefaultResponseMessages(false);
    }

    @Bean
    public ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("Oppijanumerorekisteri")
                .description("Oppijanumerorekisteri pitää sisällään henkilöiden tietoja")
                .build();

    }

    // See: https://github.com/springfox/springfox/issues/3462
    @Bean
    public InitializingBean removeSpringfoxHandlerProvider(DocumentationPluginsBootstrapper bootstrapper) {
        return () -> bootstrapper.getHandlerProviders().removeIf(WebMvcRequestHandlerProvider.class::isInstance);
    }

    @Bean
    public RequestHandlerProvider customRequestHandlerProvider(Optional<ServletContext> servletContext, HandlerMethodResolver methodResolver, List<RequestMappingInfoHandlerMapping> handlerMappings) {
        String contextPath = servletContext.map(ServletContext::getContextPath).orElse(ROOT);
        return () -> handlerMappings.stream()
                .map(mapping -> mapping.getHandlerMethods().entrySet())
                .flatMap(Set::stream)
                .map(entry -> new WebMvcRequestHandler(contextPath, methodResolver, tweakInfo(entry.getKey()), entry.getValue()))
                .sorted(byPatternsCondition())
                .collect(toList());
    }

    RequestMappingInfo tweakInfo(RequestMappingInfo info) {
        if (info.getPathPatternsCondition() == null) return info;
        String[] patterns = new String[]{};
        PathPatternsRequestCondition pathPatterns = info.getPathPatternsCondition();
        if (pathPatterns != null) {
            patterns = pathPatterns.getPatternValues().toArray(String[]::new);
        }
        return info.mutate().options(new org.springframework.web.servlet.mvc.method.RequestMappingInfo.BuilderConfiguration()).paths(patterns).build();
    }
}
