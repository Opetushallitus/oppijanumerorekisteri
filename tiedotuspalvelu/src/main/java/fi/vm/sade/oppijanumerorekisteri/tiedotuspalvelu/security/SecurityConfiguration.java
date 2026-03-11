package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import fi.vm.sade.JdbcSessionMappingStorage;
import lombok.RequiredArgsConstructor;
import org.apereo.cas.client.session.SingleSignOutFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
  @Bean
  @Order(1)
  SecurityFilterChain publicSecurityFilterChain(HttpSecurity http) throws Exception {
    http.securityMatcher(
            "/actuator/health",
            "/omat-viestit/ui/localisations",
            "/omat-viestit/swagger-ui/**",
            "/omat-viestit/v3/api-docs/**")
        .csrf(CsrfConfigurer::disable)
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

    return http.build();
  }

  @Bean
  @Order(2)
  SecurityFilterChain oauth2SecurityFilterChain(
      HttpSecurity http, Converter<Jwt, AbstractAuthenticationToken> oauth2JwtConverter)
      throws Exception {
    return http.securityMatcher("/omat-viestit/api/**")
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .oauth2ResourceServer(
            oauth2 ->
                oauth2.jwt(
                    jwt -> {
                      jwt.jwtAuthenticationConverter(oauth2JwtConverter);
                    }))
        .csrf(CsrfConfigurer::disable)
        .build();
  }

  @Bean
  @Order(3)
  SecurityFilterChain virkailijaSecurityFilterChain(
      HttpSecurity http,
      @Qualifier(CasVirkailijaConfiguration.CAS_VIRKAILIJA_QUALIFIER)
          AuthenticationProvider virkailijaAuthProvider,
      @Qualifier(CasVirkailijaConfiguration.CAS_VIRKAILIJA_QUALIFIER)
          CasAuthenticationFilter virkailijaCasFilter,
      @Qualifier(CasVirkailijaConfiguration.CAS_VIRKAILIJA_QUALIFIER)
          SingleSignOutFilter virkailijaSsoFilter,
      @Qualifier(CasVirkailijaConfiguration.CAS_VIRKAILIJA_QUALIFIER)
          SecurityContextRepository virkailijaCtxRepo,
      @Qualifier(CasVirkailijaConfiguration.CAS_VIRKAILIJA_QUALIFIER)
          LogoutSuccessHandler virkailijaLogoutHandler,
      @Qualifier(CasVirkailijaConfiguration.CAS_VIRKAILIJA_QUALIFIER)
          CasAuthenticationEntryPoint virkailijaCasEntryPoint)
      throws Exception {
    http.securityMatcher("/tiedotuspalvelu/**")
        .csrf(CsrfConfigurer::disable)
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .authenticationProvider(virkailijaAuthProvider)
        .addFilterAt(virkailijaCasFilter, CasAuthenticationFilter.class)
        .addFilterBefore(virkailijaSsoFilter, CasAuthenticationFilter.class)
        .securityContext(
            context ->
                context.requireExplicitSave(true).securityContextRepository(virkailijaCtxRepo))
        .exceptionHandling(handler -> handler.authenticationEntryPoint(virkailijaCasEntryPoint))
        .logout(
            logout ->
                logout
                    .logoutUrl("/tiedotuspalvelu/logout")
                    .logoutSuccessHandler(virkailijaLogoutHandler));

    return http.build();
  }

  // ── Order 4: Oppija CAS ────────────────────────────────────────────────────

  @Bean
  @Order(4)
  SecurityFilterChain oppijaSecurityFilterChain(
      HttpSecurity http,
      @Qualifier(CasOppijaConfiguration.CAS_OPPIJA_QUALIFIER)
          AuthenticationProvider oppijaAuthProvider,
      @Qualifier(CasOppijaConfiguration.CAS_OPPIJA_QUALIFIER)
          CasAuthenticationFilter oppijaCasFilter,
      @Qualifier(CasOppijaConfiguration.CAS_OPPIJA_QUALIFIER) SingleSignOutFilter oppijaSsoFilter,
      @Qualifier(CasOppijaConfiguration.CAS_OPPIJA_QUALIFIER)
          SecurityContextRepository oppijaCtxRepo,
      @Qualifier(CasOppijaConfiguration.CAS_OPPIJA_QUALIFIER)
          LogoutSuccessHandler oppijaLogoutHandler,
      @Qualifier(CasOppijaConfiguration.CAS_OPPIJA_QUALIFIER)
          CasAuthenticationEntryPoint oppijaCasEntryPoint)
      throws Exception {
    http.securityMatcher("/omat-viestit/**")
        .csrf(CsrfConfigurer::disable)
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .authenticationProvider(oppijaAuthProvider)
        .addFilterAt(oppijaCasFilter, CasAuthenticationFilter.class)
        .addFilterBefore(oppijaSsoFilter, CasAuthenticationFilter.class)
        .securityContext(
            context -> context.requireExplicitSave(true).securityContextRepository(oppijaCtxRepo))
        .exceptionHandling(handler -> handler.authenticationEntryPoint(oppijaCasEntryPoint))
        .logout(
            logout ->
                logout.logoutUrl("/omat-viestit/logout").logoutSuccessHandler(oppijaLogoutHandler));

    return http.build();
  }

  @Bean
  JdbcSessionMappingStorage jdbcSessionMappingStorage(
      JdbcTemplate jdbcTemplate, SessionRepository<? extends Session> sessionRepository) {
    return new JdbcSessionMappingStorage(jdbcTemplate, sessionRepository);
  }
}
