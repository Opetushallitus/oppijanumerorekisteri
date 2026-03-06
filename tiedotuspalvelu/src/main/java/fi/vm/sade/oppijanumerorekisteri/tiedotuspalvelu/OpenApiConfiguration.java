package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.webmvc.ui.SwaggerIndexPageTransformer;
import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.ResourceTransformerChain;
import org.springframework.web.servlet.resource.TransformedResource;

@Configuration
public class OpenApiConfiguration {

  @Bean
  OpenAPI openAPI(TiedotuspalveluProperties properties) {
    var securitySchemeName = "oauth2-client-credentials";
    return new OpenAPI()
        .info(new Info().title("Tiedotuspalvelu").description("Tiedotuspalvelun API"))
        .servers(List.of(new Server().url(properties.apiBaseUrl() + "/omat-viestit")))
        .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
        .components(
            new Components()
                .addSecuritySchemes(
                    securitySchemeName,
                    new SecurityScheme()
                        .type(SecurityScheme.Type.OAUTH2)
                        .flows(
                            new OAuthFlows()
                                .clientCredentials(
                                    new OAuthFlow()
                                        .tokenUrl(properties.swaggerUi().oauth2TokenUrl())))));
  }

  /**
   * Custom Swagger UI transformer that injects a requestInterceptor to use client_secret_post (form
   * body) instead of client_secret_basic (Basic Auth header) for the OAuth2 token request. Swagger
   * UI hardcodes Basic Auth for client_credentials flow, but our OAuth2 authorization server only
   * supports client_secret_post.
   */
  @Bean
  SwaggerIndexTransformer indexPageTransformer(
      SwaggerUiConfigProperties config,
      SwaggerUiOAuthProperties oauthConfig,
      SwaggerWelcomeCommon welcomeCommon,
      ObjectMapperProvider objectMapperProvider) {
    return new SwaggerIndexPageTransformer(
        config, oauthConfig, welcomeCommon, objectMapperProvider) {
      @Override
      public Resource transform(
          HttpServletRequest request, Resource resource, ResourceTransformerChain chain)
          throws IOException {
        var transformed = super.transform(request, resource, chain);
        if (!resource.getURL().toString().contains("swagger-initializer.js")) {
          return transformed;
        }
        var js = new String(transformed.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        js = injectClientSecretPostInterceptor(js);
        return new TransformedResource(resource, js.getBytes(StandardCharsets.UTF_8));
      }
    };
  }

  /**
   * Injects a requestInterceptor into the SwaggerUIBundle config that moves client credentials from
   * the Authorization Basic header to the form body (client_secret_post).
   */
  static String injectClientSecretPostInterceptor(String js) {
    // language=JavaScript
    var interceptor =
        """
        requestInterceptor: function(req) {
          if (req.headers && req.headers.Authorization && req.headers.Authorization.startsWith('Basic ') && req.body && req.body.includes('grant_type=client_credentials')) {
            var decoded = atob(req.headers.Authorization.substring(6));
            var parts = decoded.split(':');
            delete req.headers.Authorization;
            req.body += '&client_id=' + encodeURIComponent(parts[0]) + '&client_secret=' + encodeURIComponent(parts[1]);
          }
          return req;
        }""";
    return js.replace("deepLinking: true", "deepLinking: true,\n    " + interceptor.strip());
  }
}
