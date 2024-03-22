package fi.vm.sade.oppijanumerorekisteri.configurations.security;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Profile("dev")
@Configuration
@EnableWebSecurity
public class SecurityDevConfiguration {
    private DevProperties devProperties;

    public SecurityDevConfiguration(DevProperties devProperties) {
        this.devProperties = devProperties;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .httpBasic(it -> {})
            .headers(headers -> headers.disable())
            .csrf(csrf -> csrf.disable())
            .securityMatcher("/**")
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/buildversion.txt").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-resources/**").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .anyRequest().authenticated());
        return http.build();
    }

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername(devProperties.getUsername())
                .password(passwordEncoder().encode(devProperties.getPassword()))
                .roles("APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
                .build();
        return new InMemoryUserDetailsManager(user);
    }
}
