package fi.vm.sade.oppijanumerorekisteri.configurations.db;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DatasourceProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

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
