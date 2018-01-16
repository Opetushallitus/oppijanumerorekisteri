package fi.vm.sade.henkiloui.configurations.security;

import fi.vm.sade.henkiloui.configurations.properties.DevProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Profile("dev")
@Configuration
@EnableGlobalMethodSecurity(jsr250Enabled = false, prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class SecurityDevConfiguration extends WebSecurityConfigurerAdapter {
    private DevProperties devProperties;

    @Autowired
    public SecurityDevConfiguration(DevProperties devProperties) {
        this.devProperties = devProperties;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.httpBasic()
        .and()
        .csrf().disable()
                .authorizeRequests()
                .antMatchers("/buildversion.txt").permitAll()
                .antMatchers("/swagger-ui.html").permitAll()
                .antMatchers("/swagger-resources/**").permitAll()
                .antMatchers("/v2/api-docs").permitAll()
                // To allow unauthorized user load the app where it's permitted
                .antMatchers("/favicon.ico").permitAll()
                .antMatchers("/static/js/*").permitAll()
                .antMatchers("/static/css/*").permitAll()
                .antMatchers("/static/media/*").permitAll()
                .antMatchers("/config/frontProperties").permitAll()
                .antMatchers("/l10n").permitAll()
                .antMatchers("/vahvatunnistusinfo/*/*").permitAll()
                .antMatchers("/vahvatunnistusinfo/virhe/*/*").permitAll()
                .antMatchers("/vahvatunnistusinfo/lisatiedot/**").permitAll()
                .antMatchers("/rekisteroidy").permitAll()
                .antMatchers("/salasananresetointi/*/*").permitAll()
                // Admin domain
                .antMatchers("/admin/**").hasAuthority("APP_HENKILONHALLINTA_OPHREKISTERI")
                .anyRequest().authenticated();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
                .withUser(devProperties.getUsername()).password(devProperties.getPassword())
                .authorities("APP_HENKILONHALLINTA_OPHREKISTERI")
                .and()
                .withUser(devProperties.getUsername()+"1").password(devProperties.getPassword()+"1")
                .authorities("USER");
    }
}
