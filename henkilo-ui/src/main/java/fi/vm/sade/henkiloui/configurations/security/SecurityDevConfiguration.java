package fi.vm.sade.henkiloui.configurations.security;

import fi.vm.sade.henkiloui.configurations.properties.DevProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;

@Profile("dev")
@Configuration
@EnableGlobalMethodSecurity(jsr250Enabled = false, prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class SecurityDevConfiguration extends WebSecurityConfigurerAdapter {
    private final DevProperties devProperties;

    @SuppressWarnings("deprecation")
    @Bean
    static NoOpPasswordEncoder passwordEncoder() {
        return (NoOpPasswordEncoder) NoOpPasswordEncoder.getInstance();
    }

    public SecurityDevConfiguration(DevProperties devProperties) {
        this.devProperties = devProperties;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.httpBasic()
                .and()
                .headers().disable()
                .csrf().disable()
                .authorizeRequests()
                .antMatchers("/buildversion.txt").permitAll()
                // To allow unauthorized user load the app where it's permitted
                .antMatchers("/favicon.ico").permitAll()
                .antMatchers("/static/js/*").permitAll()
                .antMatchers("/static/css/*").permitAll()
                .antMatchers("/static/media/*").permitAll()
                .antMatchers("/config/frontProperties").permitAll()
                .antMatchers("/l10n").permitAll()
                .antMatchers("/vahvatunnistusinfo/*/*").permitAll()
                .antMatchers("/vahvatunnistusinfo/virhe/*/*").permitAll()
                .antMatchers("/uudelleenrekisterointi/**").permitAll()
                .antMatchers("/rekisteroidy").permitAll()
                .antMatchers("/salasananresetointi/*/*").permitAll()
                .antMatchers("/sahkopostivarmistus/*/*").permitAll()
                .antMatchers("/sahkopostivarmistus/virhe/*/*/*").permitAll()
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
                .withUser(devProperties.getUsername() + "1").password(devProperties.getPassword() + "1")
                .authorities("USER");
    }
}
