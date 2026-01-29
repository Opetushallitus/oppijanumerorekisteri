package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apereo.cas.client.session.SingleSignOutFilter;
import org.apereo.cas.client.validation.Cas30ServiceTicketValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
  static final String SPRING_CAS_SECURITY_CHECK_PATH = "/j_spring_cas_security_check";

  private final TiedotuspalveluProperties properties;

  @Bean
  @Order(1)
  SecurityFilterChain publicSecurityFilterChain(HttpSecurity http) throws Exception {
    http.securityMatcher("/actuator/health")
        .csrf(CsrfConfigurer::disable)
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

    return http.build();
  }

  @Bean
  @Order(2)
  SecurityFilterChain oauth2SecurityFilterChain(HttpSecurity http) throws Exception {
    return http.securityMatcher("/api/**")
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .oauth2ResourceServer(
            oauth2 ->
                oauth2.jwt(
                    jwt -> {
                      jwt.jwtAuthenticationConverter(oauth2JwtConverter());
                    }))
        .csrf(CsrfConfigurer::disable)
        .build();
  }

  Converter<Jwt, AbstractAuthenticationToken> oauth2JwtConverter() {
    return new Converter<>() {
      final JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();

      @Override
      public AbstractAuthenticationToken convert(Jwt source) {
        var authorityList = extractRoles(source);
        var delegateAuthorities = delegate.convert(source);
        authorityList.addAll(delegateAuthorities);
        return new JwtAuthenticationToken(source, authorityList);
      }

      private List<GrantedAuthority> extractRoles(Jwt jwt) {
        Map<String, List<String>> roleClaim =
            jwt.getClaims().get("roles") != null
                ? (Map<String, List<String>>) jwt.getClaims().get("roles")
                : Map.of();
        var roles =
            roleClaim.keySet().stream()
                .map(
                    (oid) -> {
                      var orgRoles = roleClaim.get(oid);
                      return orgRoles.stream()
                          .map(
                              (role) -> List.of("ROLE_APP_" + role, "ROLE_APP_" + role + "_" + oid))
                          .toList();
                    })
                .flatMap(List::stream)
                .flatMap(List::stream)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.<GrantedAuthority>toList());
        return roles;
      }
    };
  }

  @Bean
  @Order(3)
  SecurityFilterChain casSecurityFilterChain(
      HttpSecurity http,
      AuthenticationProvider casAuthenticationProvider,
      CasAuthenticationFilter casAuthenticationFilter,
      SingleSignOutFilter singleSignOutFilter,
      AuthenticationEntryPoint authenticationEntryPoint,
      SecurityContextRepository securityContextRepository,
      LogoutSuccessHandler logoutSuccessHandler)
      throws Exception {
    http.csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .authenticationProvider(casAuthenticationProvider)
        .addFilterAt(casAuthenticationFilter, CasAuthenticationFilter.class)
        .addFilterBefore(singleSignOutFilter, CasAuthenticationFilter.class)
        .securityContext(
            context ->
                context
                    .requireExplicitSave(true)
                    .securityContextRepository(securityContextRepository))
        .exceptionHandling(handler -> handler.authenticationEntryPoint(authenticationEntryPoint))
        .logout(logout -> logout.logoutSuccessHandler(logoutSuccessHandler));

    return http.build();
  }

  @Bean
  AuthenticationProvider casAuthenticationProvider(ServiceProperties serviceProperties) {
    var provider = new CasAuthenticationProvider();
    provider.setAuthenticationUserDetailsService(new CasUserDetailsService());
    provider.setServiceProperties(serviceProperties);
    provider.setTicketValidator(new Cas30ServiceTicketValidator(properties.cas().serverUrl()));
    provider.setKey("tiedotuspalvelu");
    return provider;
  }

  @Bean
  ServiceProperties serviceProperties() {
    var serviceProperties = new ServiceProperties();
    serviceProperties.setService(
        properties.cas().serviceBaseUrl() + SPRING_CAS_SECURITY_CHECK_PATH);
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
    entryPoint.setLoginUrl(properties.cas().serverUrl() + "/login");
    entryPoint.setServiceProperties(serviceProperties);
    return entryPoint;
  }

  @Bean
  CasAuthenticationFilter casAuthenticationFilter(
      AuthenticationConfiguration authenticationConfiguration,
      ServiceProperties serviceProperties,
      SecurityContextRepository securityContextRepository,
      AuthenticationSuccessHandler authenticationSuccessHandler)
      throws Exception {
    var filter = new CasAuthenticationFilter();
    filter.setAuthenticationManager(authenticationConfiguration.getAuthenticationManager());
    filter.setServiceProperties(serviceProperties);
    filter.setFilterProcessesUrl(SPRING_CAS_SECURITY_CHECK_PATH);
    filter.setSecurityContextRepository(securityContextRepository);
    filter.setAuthenticationSuccessHandler(authenticationSuccessHandler);
    return filter;
  }

  @Bean
  SecurityContextRepository securityContextRepository() {
    return new HttpSessionSecurityContextRepository();
  }

  @Bean
  AuthenticationSuccessHandler authenticationSuccessHandler() {
    var handler = new SimpleUrlAuthenticationSuccessHandler("/");
    handler.setAlwaysUseDefaultTargetUrl(true);
    return handler;
  }

  @Bean
  LogoutSuccessHandler logoutSuccessHandler() {
    var handler = new SimpleUrlLogoutSuccessHandler();
    handler.setDefaultTargetUrl("/");
    handler.setAlwaysUseDefaultTargetUrl(true);
    return handler;
  }
}
