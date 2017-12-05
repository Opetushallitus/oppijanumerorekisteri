package fi.vm.sade.oppijanumerorekisteri.configurations.security;

import fi.vm.sade.java_utils.security.OpintopolkuCasAuthenticationFilter;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.CasProperties;
import fi.vm.sade.properties.OphProperties;
import org.jasig.cas.client.session.SingleSignOutFilter;
import org.jasig.cas.client.validation.Cas20ServiceTicketValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
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
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.ldap.userdetails.LdapUserDetailsService;

import java.util.Optional;

@Profile("!dev")
@Configuration
@Import({LdapUserDetailsConfig.class, HttpMockedUserDetailsConfig.class})
@EnableGlobalMethodSecurity(jsr250Enabled = false, prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    private CasProperties casProperties;
    private OphProperties ophProperties;

    @Autowired(required = false)
    private LdapUserDetailsService ldapUserDetailsService;

    @Autowired(required = false)
    private HttpMockedUserDetailsProvider fallbackUserDetailsService;
    
    @Autowired
    public SecurityConfiguration(CasProperties casProperties, OphProperties ophProperties) {
        this.casProperties = casProperties;
        this.ophProperties = ophProperties;
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

    @Bean
    public AuthenticationUserDetailsService<CasAssertionAuthenticationToken> authenticationUserDetailsService() {
        return (CasAssertionAuthenticationToken casAssertionAuthenticationToken)
                -> Optional.<UserDetailsService>ofNullable(ldapUserDetailsService)
                .orElse(fallbackUserDetailsService).loadUserByUsername(casAssertionAuthenticationToken.getName());
    }

    @Bean
    public Cas20ServiceTicketValidator cas20ServiceTicketValidator() {
        return new Cas20ServiceTicketValidator(ophProperties.url("cas.url"));
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
    // CAS single logout filter
    //
    @Bean
    public SingleSignOutFilter singleSignOutFilter() {
        SingleSignOutFilter singleSignOutFilter = new SingleSignOutFilter();
        singleSignOutFilter.setCasServerUrlPrefix(this.ophProperties.url("url-cas"));
        singleSignOutFilter.setIgnoreInitConfiguration(true);
        return singleSignOutFilter;
    }

    //
    // CAS entry point
    //
    @Bean
    public CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
        CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
        casAuthenticationEntryPoint.setLoginUrl(ophProperties.url("cas.login"));
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
                .exceptionHandling().authenticationEntryPoint(casAuthenticationEntryPoint())
                .and()
                .addFilterBefore(singleSignOutFilter(), CasAuthenticationFilter.class);
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
        .authenticationProvider(casAuthenticationProvider());
    }
}
