package fi.vm.sade.oppijanumerorekisteri.configurations.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "authentication")
public class AuthenticationProperties {
    @Getter
    @Setter
    public static class Kayttooikeus {
        private String username;
        private String password;
    }
    @Getter
    @Setter
    public static class Vtj {
        private String username;
        private String password;
    }

    @Getter
    @Setter
    public static class Hakuapp {
        private String username;
        private String password;
    }

    @Getter
    @Setter
    public static class Henkilotietomuutos {
        private String username;
        private String password;
    }

    private Kayttooikeus kayttooikeus = new Kayttooikeus();
    private Vtj vtj = new Vtj();
    private Hakuapp hakuapp = new Hakuapp();
    private Henkilotietomuutos henkilotietomuutos = new Henkilotietomuutos();
}
