package fi.vm.sade.oppijanumerorekisteri.configurations.properties;

import com.zaxxer.hikari.HikariConfig;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "hikari.datasource", ignoreUnknownFields = false)
public class HikariProperties extends HikariConfig {
//    private String driverClassName;
//    private String jdbcUrl;
//    private String username;
//    private String password;
//    private int maximumPoolSize;
}
