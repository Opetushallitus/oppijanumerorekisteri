package fi.vm.sade.oppijanumerorekisteri.tiedotteet.cas;

import org.apereo.cas.client.session.SingleSignOutFilter;
import org.apereo.cas.client.validation.Cas30ServiceTicketValidator;
import org.apereo.cas.client.validation.TicketValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;

@Configuration
@EnableWebSecurity
public class CasConfiguration {
    static final String SPRING_CAS_SECURITY_CHECK_PATH = "/j_spring_cas_security_check";

    @Value("${tiedotteet.cas.server-url}")
    private String casServerUrl;
    @Value("${tiedotteet.cas.service-base-url}")
    private String serviceBaseUrl;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider casAuthenticationProvider,
            CasAuthenticationFilter casAuthenticationFilter,
            SingleSignOutFilter singleSignOutFilter,
            AuthenticationEntryPoint authenticationEntryPoint,
            SecurityContextRepository securityContextRepository
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/static/**", "/favicon.ico").permitAll()
                        .anyRequest().authenticated())
                .authenticationProvider(casAuthenticationProvider)
                .addFilterAt(casAuthenticationFilter, CasAuthenticationFilter.class)
                .addFilterBefore(singleSignOutFilter, CasAuthenticationFilter.class)
                .securityContext(context -> context
                        .requireExplicitSave(true)
                        .securityContextRepository(securityContextRepository))
                .exceptionHandling(handler -> handler.authenticationEntryPoint(authenticationEntryPoint));

        return http.build();
    }

    @Bean
    AuthenticationProvider casAuthenticationProvider(ServiceProperties serviceProperties) {
        var provider = new CasAuthenticationProvider();
        provider.setAuthenticationUserDetailsService(new CasUserDetailsService());
        provider.setServiceProperties(serviceProperties);
        provider.setTicketValidator(new Cas30ServiceTicketValidator(casServerUrl));
        provider.setKey("tiedotteet");
        return provider;
    }

    @Bean
    ServiceProperties serviceProperties() {
        var serviceProperties = new ServiceProperties();
        serviceProperties.setService(serviceBaseUrl + SPRING_CAS_SECURITY_CHECK_PATH);
        serviceProperties.setSendRenew(false);
        serviceProperties.setAuthenticateAllArtifacts(true);
        return serviceProperties;
    }


    @Bean
    SingleSignOutFilter singleSignOutFilter() {
        var filter = new SingleSignOutFilter();
        filter.setIgnoreInitConfiguration(true);
        return filter;
    }

    @Bean
    AuthenticationEntryPoint casAuthenticationEntryPoint(ServiceProperties serviceProperties) {
        CasAuthenticationEntryPoint entryPoint = new CasAuthenticationEntryPoint();
        entryPoint.setLoginUrl(casServerUrl + "/login");
        entryPoint.setServiceProperties(serviceProperties);
        return entryPoint;
    }

    @Bean
    CasAuthenticationFilter casAuthenticationFilter(
            AuthenticationConfiguration authenticationConfiguration,
            ServiceProperties serviceProperties,
            SecurityContextRepository securityContextRepository) throws Exception {
        var filter = new CasAuthenticationFilter();
        filter.setAuthenticationManager(authenticationConfiguration.getAuthenticationManager());
        filter.setServiceProperties(serviceProperties);
        filter.setFilterProcessesUrl(SPRING_CAS_SECURITY_CHECK_PATH);
        filter.setSecurityContextRepository(securityContextRepository);
        return filter;
    }


    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }
}
