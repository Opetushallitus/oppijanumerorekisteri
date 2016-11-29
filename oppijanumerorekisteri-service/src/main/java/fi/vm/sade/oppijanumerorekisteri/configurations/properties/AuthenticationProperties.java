package fi.vm.sade.oppijanumerorekisteri.configurations.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "authentication", ignoreUnknownFields = false, ignoreInvalidFields = false)
public class AuthenticationProperties {
    @Getter
    @Setter
    public static class Kayttooikeus {
        private String username;
        private String password;
    }
    private Kayttooikeus kayttooikeus;
}