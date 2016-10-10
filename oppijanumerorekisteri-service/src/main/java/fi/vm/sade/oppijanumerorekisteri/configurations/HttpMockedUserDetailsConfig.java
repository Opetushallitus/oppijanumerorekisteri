package fi.vm.sade.oppijanumerorekisteri.configurations;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.CasProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * User: tommiratamaa
 * Date: 10/10/2016
 * Time: 11.10
 */
@Configuration
@Conditional(value = HttpMockedUserDetailsConfig.UseCondition.class)
public class HttpMockedUserDetailsConfig {
    private CasProperties casProperties;
    
    @Autowired
    public HttpMockedUserDetailsConfig(CasProperties casProperties) {
        this.casProperties = casProperties;
    }
    
    @Bean
    public HttpMockedUserDetailsProvider httpMockedUserDetailsProvider() {
        return new HttpMockedUserDetailsProvider(casProperties.getFallbackUserDetailsProviderUrl(), new ObjectMapper());
    }

    public static class UseCondition implements Condition {
        @Override
        public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {
            String mockCas = conditionContext.getEnvironment().getProperty("mock.ldap");
            return "true".equals(mockCas);
        }
    }
}
