package fi.vm.sade.henkiloui.configurations.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "dev")
public class DevProperties {
    private String username = "test";
    private String password = "test";
}
