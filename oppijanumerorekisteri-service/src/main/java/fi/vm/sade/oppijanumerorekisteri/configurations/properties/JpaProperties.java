package fi.vm.sade.oppijanumerorekisteri.configurations.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "jpa", ignoreInvalidFields = false, ignoreUnknownFields = false)
public class JpaProperties {
    @Getter
    @Setter
    public static class Hibernate {
        private String dialect;
        private String implicitNamingStrategy;
        private String ddlAuto;
    }
    @Getter
    @Setter
    public static class Connection {
        private String charset;
    }
    @Getter
    @Setter
    public static class Archive {
        private String autodetection;
    }

    private Hibernate hibernate;
    private Connection connection;
    private Archive archive;

    private Boolean showSql;
    private Boolean formatSql;
    private String currentSessionContextClass;

}
