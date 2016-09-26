package fi.vm.sade.oppijanumerorekisteri.configurations;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaDialect;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaDialect;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.Arrays;
import java.util.Properties;

@Configuration
@EnableJpaRepositories(basePackages = {"fi.vm.sade.oppijanumerorekisteri.DAOs"})
@EntityScan({"fi.vm.sade.oppijanumerorekisteri.models"})
@EnableTransactionManagement
public class JpaConfiguration {
    private Environment env;

    private DataSource dataSource;

    @Autowired
    public JpaConfiguration(Environment environment, DataSource dataSource) {
        this.env = environment;
        this.dataSource = dataSource;
    }

    @Bean
    public JpaVendorAdapter jpaVendorAdapter() {
        HibernateJpaVendorAdapter hibernateJpaVendorAdapter = new HibernateJpaVendorAdapter();
        hibernateJpaVendorAdapter.setShowSql( Boolean.parseBoolean(env.getProperty("jpa.show-sql")));
        hibernateJpaVendorAdapter.setGenerateDdl(true);
        hibernateJpaVendorAdapter.setDatabasePlatform(env.getProperty("jpa.hibernate.dialect"));

        return hibernateJpaVendorAdapter;
    }

    @Bean
    public JpaDialect jpaDialect() {
        return new HibernateJpaDialect();
    }

    @Bean
    public JpaTransactionManager transactionManager() {
        JpaTransactionManager jpaTransactionManager = new JpaTransactionManager();
        jpaTransactionManager.setEntityManagerFactory(entityManagerFactoryBean().getObject());
        return jpaTransactionManager;
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactoryBean() {
        LocalContainerEntityManagerFactoryBean lef = new LocalContainerEntityManagerFactoryBean();
        lef.setDataSource(dataSource);
        lef.setJpaVendorAdapter(jpaVendorAdapter());
        lef.setJpaDialect(jpaDialect());
        lef.setMappingResources();

        // TODO: maybe create separate entityManagerFactoryBean() with embedded profile
        String hbm2ddl = env.getProperty("jpa.hibernate.ddl-auto");
        if(Arrays.asList(env.getActiveProfiles()).contains("embedded")) {
            hbm2ddl = "CREATE";
        }

        Properties props = new Properties();
        props.put("hibernate.show_sql", Boolean.parseBoolean(env.getProperty("jpa.show-sql")));
        props.put("hibernate.format_sql", Boolean.parseBoolean(env.getProperty("jpa.format-sql")));
        props.put("hibernate.implicit_naming_strategy", env.getProperty("jpa.hibernate.implicit-naming-strategy"));
        props.put("hibernate.connection.charSet", env.getProperty("jpa.connection.charset"));
        props.put("hibernate.current_session_context_class", env.getProperty("jpa.current-session-context-class"));
        props.put("hibernate.archive.autodetection", env.getProperty("jpa.archive.autodetection"));
//        props.put("hibernate.transaction.manager_lookup_class", env.getProperty("jpa.transaction-manager-lookup-class"));
        props.put("hibernate.dialect", env.getProperty("jpa.hibernate.dialect"));
        props.put("hibernate.hbm2ddl.auto", hbm2ddl);

        lef.setJpaProperties(props);
        lef.afterPropertiesSet();

        return lef;
    }
}
