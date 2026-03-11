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
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
@RequiredArgsConstructor
public class CasOppijaConfiguration {
  public static final String CAS_OPPIJA_QUALIFIER = "cas-oppija";
  public static final String CAS_CHECK_SUFFIX = "/j_spring_cas_security_check";
  public static final String OPPIJA_CAS_CHECK_PATH = "/omat-viestit" + CAS_CHECK_SUFFIX;

  private final TiedotuspalveluProperties properties;

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  ServiceProperties oppijaServiceProperties() {
    var serviceProperties = new ServiceProperties();
    serviceProperties.setService(properties.casOppija().serviceBaseUrl() + CAS_CHECK_SUFFIX);
    serviceProperties.setSendRenew(false);
    serviceProperties.setAuthenticateAllArtifacts(true);
    return serviceProperties;
  }

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  public AuthenticationProvider oppijaAuthenticationProvider(
      @Qualifier(CAS_OPPIJA_QUALIFIER) ServiceProperties serviceProperties) {
    var provider = new CasAuthenticationProvider();
    provider.setAuthenticationUserDetailsService(new CasOppijaUserDetailsService());
    provider.setServiceProperties(serviceProperties);
    provider.setTicketValidator(
        new Cas30ServiceTicketValidator(properties.casOppija().serverUrl()));
    provider.setKey("tiedotuspalvelu-oppija");
    return provider;
  }

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  CasAuthenticationFilter oppijaCasAuthenticationFilter(
      @Qualifier(CAS_OPPIJA_QUALIFIER) AuthenticationProvider oppijaAuthProvider,
      @Qualifier(CAS_OPPIJA_QUALIFIER) ServiceProperties serviceProperties,
      @Qualifier(CAS_OPPIJA_QUALIFIER) SecurityContextRepository securityContextRepository,
      @Qualifier(CAS_OPPIJA_QUALIFIER) AuthenticationSuccessHandler authenticationSuccessHandler) {
    var filter = new CasAuthenticationFilter();
    filter.setAuthenticationManager(new ProviderManager(oppijaAuthProvider));
    filter.setServiceProperties(serviceProperties);
    filter.setFilterProcessesUrl(OPPIJA_CAS_CHECK_PATH);
    filter.setSecurityContextRepository(securityContextRepository);
    filter.setAuthenticationSuccessHandler(authenticationSuccessHandler);
    return filter;
  }

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  CasAuthenticationEntryPoint oppijaCasEntryPoint(
      @Qualifier(CAS_OPPIJA_QUALIFIER) ServiceProperties serviceProperties) {
    var entryPoint = new CasAuthenticationEntryPoint();
    entryPoint.setLoginUrl(properties.casOppija().serverUrl() + "/login");
    entryPoint.setServiceProperties(serviceProperties);
    return entryPoint;
  }

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  SingleSignOutFilter oppijaSingleSignOutFilter(JdbcSessionMappingStorage sessionMappingStorage) {
    var filter = new SingleSignOutFilter();
    filter.setIgnoreInitConfiguration(true);
    filter.setSessionMappingStorage(sessionMappingStorage);
    return filter;
  }

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  SecurityContextRepository oppijaSecurityContextRepository() {
    return new HttpSessionSecurityContextRepository();
  }

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  AuthenticationSuccessHandler oppijaAuthenticationSuccessHandler() {
    var returnUrl = properties.casOppija().serviceBaseUrl() + "/";
    var handler = new SimpleUrlAuthenticationSuccessHandler(returnUrl);
    handler.setAlwaysUseDefaultTargetUrl(true);
    return handler;
  }

  @Bean
  @Qualifier(CAS_OPPIJA_QUALIFIER)
  LogoutSuccessHandler oppijaLogoutSuccessHandler() {
    var returnUrl = properties.casOppija().serviceBaseUrl() + "/";
    var casLogoutUrl =
        properties.casOppija().serverUrl()
            + "/logout?service="
            + URLEncoder.encode(returnUrl, StandardCharsets.UTF_8);
    var handler = new SimpleUrlLogoutSuccessHandler();
    handler.setDefaultTargetUrl(casLogoutUrl);
    handler.setAlwaysUseDefaultTargetUrl(true);
    return handler;
  }
}
