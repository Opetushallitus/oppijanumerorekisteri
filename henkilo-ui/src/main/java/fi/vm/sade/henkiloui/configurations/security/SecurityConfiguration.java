package fi.vm.sade.henkiloui.configurations.security;

import fi.vm.sade.henkiloui.configurations.properties.CasProperties;
import fi.vm.sade.properties.OphProperties;

import org.apereo.cas.client.session.SingleSignOutFilter;
import org.apereo.cas.client.validation.Cas30ServiceTicketValidator;
import org.apereo.cas.client.validation.TicketValidator;
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
public class SecurityConfiguration {
    private final CasProperties casProperties;
    private final OphProperties ophProperties;
    public static final String SPRING_CAS_SECURITY_CHECK_PATH = "/j_spring_cas_security_check";

    public SecurityConfiguration(CasProperties casProperties,
                                 OphProperties ophProperties) {
        this.casProperties = casProperties;
        this.ophProperties = ophProperties;
    }

    @Bean
    ServiceProperties serviceProperties() {
        ServiceProperties serviceProperties = new ServiceProperties();
        serviceProperties.setService(casProperties.getService() + SPRING_CAS_SECURITY_CHECK_PATH);
        serviceProperties.setSendRenew(false);
        serviceProperties.setAuthenticateAllArtifacts(true);
        return serviceProperties;
    }

    @Bean
    AuthenticationProvider casAuthenticationProvider(ServiceProperties serviceProperties, TicketValidator ticketValidator) {
        CasAuthenticationProvider casAuthenticationProvider = new CasAuthenticationProvider();
        casAuthenticationProvider.setAuthenticationUserDetailsService(new CasUserDetailsService());
        casAuthenticationProvider.setServiceProperties(serviceProperties);
        casAuthenticationProvider.setTicketValidator(ticketValidator);
        casAuthenticationProvider.setKey("oppijanumerorekisteri-service");
        return casAuthenticationProvider;
    }

    @Bean
    TicketValidator casTicketValidator() {
        return new Cas30ServiceTicketValidator(ophProperties.url("cas.url"));
    }

    @Bean
    HttpSessionSecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SingleSignOutFilter singleSignOutFilter() {
        SingleSignOutFilter singleSignOutFilter = new SingleSignOutFilter();
        singleSignOutFilter.setIgnoreInitConfiguration(true);
        return singleSignOutFilter;
    }

    @Bean
    AuthenticationEntryPoint casAuthenticationEntryPoint() {
        CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
        casAuthenticationEntryPoint.setLoginUrl(ophProperties.url("cas.login"));
        casAuthenticationEntryPoint.setServiceProperties(serviceProperties());
        return casAuthenticationEntryPoint;
    }

    @Bean
    CasAuthenticationFilter casAuthenticationFilter(
            AuthenticationConfiguration authenticationConfiguration,
            ServiceProperties serviceProperties,
            SecurityContextRepository securityContextRepository) throws Exception {
        CasAuthenticationFilter casAuthenticationFilter = new CasAuthenticationFilter();
        casAuthenticationFilter.setAuthenticationManager(authenticationConfiguration.getAuthenticationManager());
        casAuthenticationFilter.setServiceProperties(serviceProperties);
        casAuthenticationFilter.setFilterProcessesUrl(SPRING_CAS_SECURITY_CHECK_PATH);
        casAuthenticationFilter.setSecurityContextRepository(securityContextRepository);
        return casAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, CasAuthenticationFilter casAuthenticationFilter,
            AuthenticationEntryPoint authenticationEntryPoint, SecurityContextRepository securityContextRepository) throws Exception {
        HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
        requestCache.setMatchingRequestParameterName(null);
        http
            .headers(headers -> headers.disable())
            .csrf(csrf -> csrf.disable())
            .securityMatcher("/**")
            .authorizeHttpRequests(authz -> authz
                    .requestMatchers("/actuator/**").permitAll()
                    .requestMatchers("/favicon.ico").permitAll()
                    .requestMatchers("/static/**").permitAll()
                    .requestMatchers("/kayttaja/**").permitAll()
                    .requestMatchers("/kayttaja.html").permitAll()
                    .anyRequest().authenticated())
            .addFilterAt(casAuthenticationFilter, CasAuthenticationFilter.class)
            .addFilterBefore(singleSignOutFilter(), CasAuthenticationFilter.class)
            .securityContext(securityContext -> securityContext
                .requireExplicitSave(true)
                .securityContextRepository(securityContextRepository))
            .requestCache(cache -> cache.requestCache(requestCache))
            .exceptionHandling(handling -> handling.authenticationEntryPoint(authenticationEntryPoint));
        return http.build();
    }
}
