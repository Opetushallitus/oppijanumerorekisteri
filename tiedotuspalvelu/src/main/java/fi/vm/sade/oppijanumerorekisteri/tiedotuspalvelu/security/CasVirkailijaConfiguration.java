package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import fi.vm.sade.JdbcSessionMappingStorage;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.apereo.cas.client.session.SingleSignOutFilter;
import org.apereo.cas.client.validation.Cas30ServiceTicketValidator;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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
public class CasVirkailijaConfiguration {
  static final String CAS_VIRKAILIJA_QUALIFIER = "cas-virkailija";
  static final String CAS_CHECK_SUFFIX = "/j_spring_cas_security_check";
  static final String VIRKAILIJA_CAS_CHECK_PATH = "/tiedotuspalvelu" + CAS_CHECK_SUFFIX;

  private final TiedotuspalveluProperties properties;

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  ServiceProperties virkailijaServiceProperties() {
    var serviceProperties = new ServiceProperties();
    serviceProperties.setService(properties.casVirkailija().serviceBaseUrl() + CAS_CHECK_SUFFIX);
    serviceProperties.setSendRenew(false);
    serviceProperties.setAuthenticateAllArtifacts(true);
    return serviceProperties;
  }

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  AuthenticationProvider virkailijaAuthenticationProvider(
      @Qualifier(CAS_VIRKAILIJA_QUALIFIER) ServiceProperties serviceProperties) {
    var provider = new CasAuthenticationProvider();
    provider.setAuthenticationUserDetailsService(new CasVirkailijaUserDetailsService());
    provider.setServiceProperties(serviceProperties);
    provider.setTicketValidator(
        new Cas30ServiceTicketValidator(properties.casVirkailija().serverUrl()));
    provider.setKey("tiedotuspalvelu-virkailija");
    return provider;
  }

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  CasAuthenticationFilter virkailijaCasAuthenticationFilter(
      @Qualifier(CAS_VIRKAILIJA_QUALIFIER) AuthenticationProvider virkailijaAuthProvider,
      @Qualifier(CAS_VIRKAILIJA_QUALIFIER) ServiceProperties serviceProperties,
      @Qualifier(CAS_VIRKAILIJA_QUALIFIER) SecurityContextRepository securityContextRepository,
      @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
          AuthenticationSuccessHandler authenticationSuccessHandler) {
    var filter = new CasAuthenticationFilter();
    filter.setAuthenticationManager(new ProviderManager(virkailijaAuthProvider));
    filter.setServiceProperties(serviceProperties);
    filter.setFilterProcessesUrl(VIRKAILIJA_CAS_CHECK_PATH);
    filter.setSecurityContextRepository(securityContextRepository);
    filter.setAuthenticationSuccessHandler(authenticationSuccessHandler);
    return filter;
  }

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  CasAuthenticationEntryPoint virkailijaCasEntryPoint(
      @Qualifier(CAS_VIRKAILIJA_QUALIFIER) ServiceProperties serviceProperties) {
    var entryPoint = new CasAuthenticationEntryPoint();
    entryPoint.setLoginUrl(properties.casVirkailija().serverUrl() + "/login");
    entryPoint.setServiceProperties(serviceProperties);
    return entryPoint;
  }

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  SingleSignOutFilter virkailijaSingleSignOutFilter(
      JdbcSessionMappingStorage sessionMappingStorage) {
    var filter = new SingleSignOutFilter();
    filter.setIgnoreInitConfiguration(true);
    filter.setSessionMappingStorage(sessionMappingStorage);
    return filter;
  }

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  SecurityContextRepository virkailijaSecurityContextRepository() {
    return new HttpSessionSecurityContextRepository();
  }

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  AuthenticationSuccessHandler virkailijaAuthenticationSuccessHandler() {
    var returnUrl = properties.casVirkailija().serviceBaseUrl() + "/";
    var handler = new SimpleUrlAuthenticationSuccessHandler(returnUrl);
    handler.setAlwaysUseDefaultTargetUrl(true);
    return handler;
  }

  @Bean
  @Qualifier(CAS_VIRKAILIJA_QUALIFIER)
  LogoutSuccessHandler virkailijaLogoutSuccessHandler() {
    var returnUrl = properties.casVirkailija().serviceBaseUrl() + "/";
    var casLogoutUrl =
        properties.casVirkailija().serverUrl()
            + "/logout?service="
            + URLEncoder.encode(returnUrl, StandardCharsets.UTF_8);
    var handler = new SimpleUrlLogoutSuccessHandler();
    handler.setDefaultTargetUrl(casLogoutUrl);
    handler.setAlwaysUseDefaultTargetUrl(true);
    return handler;
  }
}
