package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.jasig.cas.client.validation.Cas20ServiceTicketValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAssertionAuthenticationToken;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.security.ldap.userdetails.LdapUserDetailsService;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;

import java.util.Collection;

// Sample of using multiple <http> configs if needed
// https://github.com/spring-projects/spring-security/blob/master/config/src/test/groovy/org/springframework/security/config/annotation/web/SampleWebSecurityConfigurerAdapterTests.groovy#L277

@Profile("!dev")
@Configuration
@EnableGlobalMethodSecurity(jsr250Enabled = false, prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Bean
    public ServiceProperties serviceProperties() {
        ServiceProperties serviceProperties = new ServiceProperties();
        serviceProperties.setService("https://localhost:8443/cas-sample/j_spring_cas_security_check");
        serviceProperties.setSendRenew(false);
        return serviceProperties;
    }

    //
    // CAS authentication provider (authentication manager)
    //

    @Bean
    public CasAuthenticationProvider casAuthenticationProvider() {
        CasAuthenticationProvider casAuthenticationProvider = new CasAuthenticationProvider();
        casAuthenticationProvider.setAuthenticationUserDetailsService(authenticationUserDetailsService());
        casAuthenticationProvider.setServiceProperties(serviceProperties());
        casAuthenticationProvider.setTicketValidator(cas20ServiceTicketValidator());
        casAuthenticationProvider.setKey("an_id_for_this_auth_provider_only");
        return casAuthenticationProvider;
    }

    //
    // LDAP
    //

    @Bean
    public LdapContextSource ldapContextSource() {
        LdapContextSource ldapContextSource = new LdapContextSource();
        ldapContextSource.setUrl("${ldap.url.with.base}");
        ldapContextSource.setUserDn("${ldap.manager-dn}"); // Correct?
        ldapContextSource.setPassword("${ldap.manager-password}");
        return ldapContextSource;
    }

    // TODO: https://github.com/Opetushallitus/generic/blob/7680b845b932239d90474fd21dfe08306acf393a/generic-common/src/main/java/fi/vm/sade/security/CustomUserDetailsMapper.java
    @Bean
    public UserDetailsContextMapper userDetailsContextMapper() {
        LdapUserDetailsMapper ldapUserDetailsMapper = new LdapUserDetailsMapper();
        ldapUserDetailsMapper.setRolePrefix("ROLE_");
        ldapUserDetailsMapper.setConvertToUpperCase(true);
        return  ldapUserDetailsMapper;
    }

    @Bean
    public LdapUserDetailsService ldapUserDetailsService() {
        FilterBasedLdapUserSearch userSearch = new FilterBasedLdapUserSearch("${cas.user-search-base}",
                "${cas.user-search-filter}", ldapContextSource());
        LdapUserDetailsService ldapUserDetailsService = new LdapUserDetailsService(userSearch);
        ldapUserDetailsService.setUserDetailsMapper(userDetailsContextMapper());
        return ldapUserDetailsService;
    }

    @Bean
    public AuthenticationUserDetailsService<CasAssertionAuthenticationToken> authenticationUserDetailsService() {
        return ((CasAssertionAuthenticationToken casAssertionAuthenticationToken)
                -> ldapUserDetailsService().loadUserByUsername(casAssertionAuthenticationToken.getName()));
    }

    @Bean
    public Cas20ServiceTicketValidator cas20ServiceTicketValidator() {
        return new Cas20ServiceTicketValidator("https://localhost:9443/cas");
    }

    //
    // CAS filter
    //

    @Bean
    public CasAuthenticationFilter casAuthenticationFilter() throws Exception {
        CasAuthenticationFilter casAuthenticationFilter = new CasAuthenticationFilter();
        casAuthenticationFilter.setAuthenticationManager(authenticationManager());
        return casAuthenticationFilter;
    }

    //
    // CAS entry point
    //

    @Bean
    public CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
        CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
        casAuthenticationEntryPoint.setLoginUrl("https://localhost:9443/cas/login");
        casAuthenticationEntryPoint.setServiceProperties(serviceProperties());
        return casAuthenticationEntryPoint;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.addFilter(casAuthenticationFilter())
        .exceptionHandling().authenticationEntryPoint(casAuthenticationEntryPoint())
        .and()
        .csrf().disable()
        .authorizeRequests()
            .antMatchers("/buildversion.txt").permitAll()
            .anyRequest().authenticated();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
        .authenticationProvider(casAuthenticationProvider());
    }
}
