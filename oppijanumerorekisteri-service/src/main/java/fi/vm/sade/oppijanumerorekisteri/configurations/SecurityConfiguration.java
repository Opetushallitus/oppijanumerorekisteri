package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.authentication.ldap.CustomUserDetailsMapper;
import fi.vm.sade.java_utils.security.OpintopolkuCasAuthenticationFilter;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.CasProperties;
import org.jasig.cas.client.validation.Cas20ServiceTicketValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.ldap.authentication.DefaultValuesAuthenticationSourceDecorator;
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
import org.springframework.security.ldap.authentication.SpringSecurityAuthenticationSource;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.userdetails.LdapUserDetailsService;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;

@Profile("!dev")
@Configuration
@EnableGlobalMethodSecurity(jsr250Enabled = false, prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    private CasProperties casProperties;

    @Autowired
    public SecurityConfiguration(CasProperties casProperties) {
        this.casProperties = casProperties;
    }

    @Bean
    public ServiceProperties serviceProperties() {
        ServiceProperties serviceProperties = new ServiceProperties();
        serviceProperties.setService(casProperties.getService() + "/j_spring_cas_security_check");
        serviceProperties.setSendRenew(casProperties.getSendRenew());
        serviceProperties.setAuthenticateAllArtifacts(true);
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
        casAuthenticationProvider.setKey(casProperties.getKey());
        return casAuthenticationProvider;
    }

    //
    // LDAP
    //

    @Bean
    public LdapContextSource ldapContextSource() {
        LdapContextSource ldapContextSource = new LdapContextSource();
        ldapContextSource.setUrl(casProperties.getLdap().getUrl());
        ldapContextSource.setAuthenticationSource(authenticationSource());
        return ldapContextSource;
    }

    @Bean
    DefaultValuesAuthenticationSourceDecorator authenticationSource() {
        DefaultValuesAuthenticationSourceDecorator decorator = new DefaultValuesAuthenticationSourceDecorator();
        decorator.setDefaultUser(casProperties.getLdap().getManagedDn());
        decorator.setDefaultPassword(casProperties.getLdap().getPassword());
        decorator.setTarget(springSecurityAuthenticationSource());
        return decorator;
    }

    @Bean
    SpringSecurityAuthenticationSource springSecurityAuthenticationSource() {
        return new SpringSecurityAuthenticationSource();
    }

    @Bean
    public UserDetailsContextMapper userDetailsContextMapper() {
        CustomUserDetailsMapper ldapUserDetailsMapper = new CustomUserDetailsMapper();
        ldapUserDetailsMapper.setRolePrefix("ROLE_");
        ldapUserDetailsMapper.setConvertToUpperCase(true);
        return ldapUserDetailsMapper;
    }

    @Bean
    public LdapUserDetailsService ldapUserDetailsService() {
        FilterBasedLdapUserSearch userSearch = new FilterBasedLdapUserSearch(casProperties.getLdap().getUserSearchBase(),
                casProperties.getLdap().getUserSearchFilter(), ldapContextSource());
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
        return new Cas20ServiceTicketValidator(casProperties.getUrl());
    }

    //
    // CAS filter
    //

    @Bean
    public CasAuthenticationFilter casAuthenticationFilter() throws Exception {
        OpintopolkuCasAuthenticationFilter casAuthenticationFilter = new OpintopolkuCasAuthenticationFilter(serviceProperties());
        casAuthenticationFilter.setAuthenticationManager(authenticationManager());
        casAuthenticationFilter.setFilterProcessesUrl("/j_spring_cas_security_check");
        return casAuthenticationFilter;
    }

    //
    // CAS entry point
    //

    @Bean
    public CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
        CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
        casAuthenticationEntryPoint.setLoginUrl(casProperties.getUrl() + "/login");
        casAuthenticationEntryPoint.setServiceProperties(serviceProperties());
        return casAuthenticationEntryPoint;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeRequests()
                    .antMatchers("/buildversion.txt").permitAll()
                    .antMatchers("/swagger-ui.html").permitAll()
                    .antMatchers("/swagger-resources/**").permitAll()
                    .antMatchers("/webjars/springfox-swagger-ui/**").permitAll()
                    .antMatchers("/v2/api-docs").permitAll()
                    .anyRequest().authenticated()
                .and()
                .addFilter(casAuthenticationFilter())
                .exceptionHandling().authenticationEntryPoint(casAuthenticationEntryPoint());
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
        .authenticationProvider(casAuthenticationProvider());
    }
}
