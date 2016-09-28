package fi.vm.sade.oppijanumerorekisteri.configurations.DB;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DatasourceProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

@Profile("!embedded")
@Configuration
public class JdbcDataConfig {

    private DatasourceProperties datasourceProperties;

    @Autowired
    public JdbcDataConfig(DatasourceProperties datasourceProperties) {
        this.datasourceProperties = datasourceProperties;
    }

    @Bean
    public DataSource dataSource() {
        DataSourceBuilder factory = DataSourceBuilder.create(this.getClass().getClassLoader())
                .driverClassName(datasourceProperties.getDriverClassName())
                .url(datasourceProperties.getUrl())
                .username(datasourceProperties.getUsername())
                .password(datasourceProperties.getPassword());
        return factory.build();
    }

}
