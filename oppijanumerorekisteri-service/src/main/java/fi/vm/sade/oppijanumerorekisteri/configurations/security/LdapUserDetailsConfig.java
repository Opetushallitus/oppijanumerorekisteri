package fi.vm.sade.oppijanumerorekisteri.configurations.security;

import fi.vm.sade.authentication.ldap.CustomUserDetailsMapper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.CasProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;
import org.springframework.security.ldap.userdetails.LdapUserDetailsService;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;

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
        LdapContextSource ldapContextSource = new DefaultSpringSecurityContextSource(casProperties.getLdap().getUrl());
        ldapContextSource.setUserDn(casProperties.getLdap().getManagedDn());
        ldapContextSource.setPassword(casProperties.getLdap().getPassword());
        return ldapContextSource;
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
