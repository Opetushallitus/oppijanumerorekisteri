package fi.vm.sade.oppijanumerorekisteri.configurations.security;

import fi.vm.sade.java_utils.security.OpintopolkuCasAuthenticationFilter;
import fi.vm.sade.javautils.kayttooikeusclient.OphUserDetailsServiceImpl;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.CasProperties;
import fi.vm.sade.properties.OphProperties;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apereo.cas.client.session.SessionMappingStorage;
import org.apereo.cas.client.session.SingleSignOutFilter;
import org.apereo.cas.client.validation.Cas30ProxyTicketValidator;
import org.apereo.cas.client.validation.TicketValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Profile("!dev")
@Configuration
@EnableMethodSecurity(jsr250Enabled = false, prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class SecurityConfiguration {
    private CasProperties casProperties;
    private OphProperties ophProperties;
    private SessionMappingStorage sessionMappingStorage;

    public static final String SPRING_CAS_SECURITY_CHECK_PATH = "/j_spring_cas_security_check";

    public SecurityConfiguration(CasProperties casProperties, OphProperties ophProperties, SessionMappingStorage sessionMappingStorage) {
        this.casProperties = casProperties;
        this.ophProperties = ophProperties;
        this.sessionMappingStorage = sessionMappingStorage;
    }

    @Bean
    ServiceProperties serviceProperties() {
        ServiceProperties serviceProperties = new ServiceProperties();
        serviceProperties.setService(casProperties.getService() + SPRING_CAS_SECURITY_CHECK_PATH);
        serviceProperties.setSendRenew(casProperties.getSendRenew());
        serviceProperties.setAuthenticateAllArtifacts(true);
        return serviceProperties;
    }

    //
    // CAS authentication provider (authentication manager)
    //

    @Bean
    CasAuthenticationProvider casAuthenticationProvider(ServiceProperties serviceProperties, TicketValidator ticketValidator) {
        CasAuthenticationProvider casAuthenticationProvider = new CasAuthenticationProvider();
        casAuthenticationProvider.setAuthenticationUserDetailsService(new OphUserDetailsServiceImpl());
        casAuthenticationProvider.setServiceProperties(serviceProperties);
        casAuthenticationProvider.setTicketValidator(ticketValidator);
        casAuthenticationProvider.setKey(casProperties.getKey());
        return casAuthenticationProvider;
    }

    @Bean
    TicketValidator ticketValidator() {
        var validator = new Cas30ProxyTicketValidator(ophProperties.url("cas.url"));
        validator.setAcceptAnyProxy(true);
        return validator;
    }

    @Bean
    HttpSessionSecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    //
    // CAS filter
    //
    @Bean
    CasAuthenticationFilter casAuthenticationFilter(
            AuthenticationConfiguration authenticationConfiguration,
            ServiceProperties serviceProperties,
            SecurityContextRepository securityContextRepository) throws Exception {
        CasAuthenticationFilter casAuthenticationFilter = new OpintopolkuCasAuthenticationFilter(serviceProperties);
        casAuthenticationFilter.setAuthenticationManager(authenticationConfiguration.getAuthenticationManager());
        casAuthenticationFilter.setServiceProperties(serviceProperties);
        casAuthenticationFilter.setFilterProcessesUrl(SPRING_CAS_SECURITY_CHECK_PATH);
        casAuthenticationFilter.setSecurityContextRepository(securityContextRepository);
        return casAuthenticationFilter;
    }

    //
    // CAS single logout filter
    // requestSingleLogoutFilter is not configured because our users always sign out through CAS logout (using virkailija-raamit
    // logout button) when CAS calls this filter if user has ticket to this service.
    //
    @Bean
    SingleSignOutFilter singleSignOutFilter() {
        SingleSignOutFilter.setSessionMappingStorage(sessionMappingStorage);
        SingleSignOutFilter singleSignOutFilter = new SingleSignOutFilter();
        singleSignOutFilter.setIgnoreInitConfiguration(true);
        return singleSignOutFilter;
    }

    //
    // CAS entry point
    //
    @Bean
    CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
        CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
        casAuthenticationEntryPoint.setLoginUrl(ophProperties.url("cas.login"));
        casAuthenticationEntryPoint.setServiceProperties(serviceProperties());
        return casAuthenticationEntryPoint;
    }

    Converter<Jwt, AbstractAuthenticationToken> oauth2JwtConverter() {
        return new Converter<Jwt, AbstractAuthenticationToken>() {
            JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();

            @Override
            public AbstractAuthenticationToken convert(Jwt source) {
                var authorityList = extractRoles(source);
                var delegateAuthorities = delegate.convert(source);
                if (delegateAuthorities != null) {
                    authorityList.addAll(delegateAuthorities);
                }
                return new JwtAuthenticationToken(source, authorityList);
            }

            private List<GrantedAuthority> extractRoles(Jwt jwt) {
                Map<String, List<String>> roleClaim = jwt.getClaims().get("roles") != null
                    ? (Map<String, List<String>>) jwt.getClaims().get("roles")
                    : Map.of();
                var roles = roleClaim.keySet()
                        .stream()
                        .map((oid) -> {
                            var orgRoles = roleClaim.get(oid);
                            return orgRoles.stream().map((role) -> List.of(
                                "ROLE_APP_" + role,
                                "ROLE_APP_" + role + "_" + oid
                            )).toList();
                        })
                        .flatMap(List::stream)
                        .flatMap(List::stream)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.<GrantedAuthority>toList());
                return roles;
            }
        };
    }

    private boolean isOauth2Request(HttpServletRequest request) {
        return request.getHeader("Authorization") != null
            && request.getHeader("Authorization").startsWith("Bearer ");
    }

    @Bean
    @Order(1)
    SecurityFilterChain oauth2FilterChain(HttpSecurity http) throws Exception {
        return http
            .headers(headers -> headers.disable())
            .csrf(csrf -> csrf.disable())
            .securityMatcher(new RequestMatcher() {
                @Override
                public boolean matches(HttpServletRequest request) {
                    return isOauth2Request(request);
                }
            })
            .authorizeHttpRequests(authz -> authz.anyRequest().authenticated())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(oauth2JwtConverter())))
            .build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain casFilterChain(HttpSecurity http, CasAuthenticationFilter casAuthenticationFilter,
            AuthenticationEntryPoint authenticationEntryPoint, SecurityContextRepository securityContextRepository) throws Exception {
        HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
        requestCache.setMatchingRequestParameterName(null);
        http
            .headers(headers -> headers.disable())
            .csrf(csrf -> csrf.disable())
            .securityMatcher(new RequestMatcher() {
                @Override
                public boolean matches(HttpServletRequest request) {
                    return !isOauth2Request(request);
                }
            })
            .authorizeHttpRequests(authz -> authz
                    .requestMatchers("/actuator/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
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
