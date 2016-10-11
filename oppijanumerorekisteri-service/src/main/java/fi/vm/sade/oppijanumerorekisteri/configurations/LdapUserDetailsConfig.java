package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.authentication.ldap.CustomUserDetailsMapper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.CasProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.ldap.authentication.DefaultValuesAuthenticationSourceDecorator;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.ldap.authentication.SpringSecurityAuthenticationSource;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;
import org.springframework.security.ldap.userdetails.LdapUserDetailsService;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;

/**
 * User: tommiratamaa
 * Date: 10/10/2016
 * Time: 10.54
 */
@Configuration
@Conditional(value = LdapUserDetailsConfig.UseCondition.class)
public class LdapUserDetailsConfig {
    private static final Logger logger = LoggerFactory.getLogger(LdapUserDetailsConfig.class);

    private CasProperties casProperties;

    @Autowired
    public LdapUserDetailsConfig(CasProperties casProperties) {
        this.casProperties = casProperties;
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
    public LdapUserDetailsService ldapUserDetailsService(LdapContextSource ldapContextSource) {
        FilterBasedLdapUserSearch userSearch = new FilterBasedLdapUserSearch(casProperties.getLdap().getUserSearchBase(),
                casProperties.getLdap().getUserSearchFilter(), ldapContextSource);
        DefaultLdapAuthoritiesPopulator ldapAuthoritiesPopulator = new DefaultLdapAuthoritiesPopulator(ldapContextSource, casProperties.getLdap().getGroupSearchBase());
        ldapAuthoritiesPopulator.setGroupSearchFilter(casProperties.getLdap().getGroupSearchFilter());
        ldapAuthoritiesPopulator.setGroupRoleAttribute(casProperties.getLdap().getGroupRoleAttribute());
        LdapUserDetailsService ldapUserDetailsService = new LdapUserDetailsService(userSearch, ldapAuthoritiesPopulator);
        ldapUserDetailsService.setUserDetailsMapper(userDetailsContextMapper());
        return ldapUserDetailsService;
    }


    public static class UseCondition implements Condition {
        @Override
        public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {
            String mockCas = conditionContext.getEnvironment().getProperty("mock.ldap");
            return !"true".equals(mockCas);
        }
    }
}
