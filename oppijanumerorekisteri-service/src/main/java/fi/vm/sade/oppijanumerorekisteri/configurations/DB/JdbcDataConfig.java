package fi.vm.sade.oppijanumerorekisteri.configurations.DB;

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
    private Environment env;

    @Autowired
    public JdbcDataConfig(Environment environment) {
        this.env = environment;
    }

    @Bean
    public DataSource dataSource() {
        DataSourceBuilder factory = DataSourceBuilder.create(this.getClass().getClassLoader())
                .driverClassName(env.getProperty("datasource.driver-class-name"))
                .url(env.getProperty("datasource.url"))
                .username(env.getProperty("datasource.username"))
                .password(env.getProperty("datasource.password"));
        return factory.build();
    }

}
