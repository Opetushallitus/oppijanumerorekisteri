package fi.vm.sade.oppijanumerorekisteri.configurations.db;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import com.querydsl.jpa.hibernate.HibernateQueryFactory;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.JpaProperties;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.hibernate5.HibernateTransactionManager;
import org.springframework.orm.jpa.JpaDialect;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaDialect;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.Arrays;
import java.util.Properties;

@Configuration
@EnableJpaRepositories(basePackages = {"fi.vm.sade.oppijanumerorekisteri.repositories"})
@ComponentScan(basePackages = "fi.vm.sade.oppijanumerorekisteri.models")
@EntityScan({"fi.vm.sade.oppijanumerorekisteri.models"})
@EnableTransactionManagement
public class JpaConfiguration {
    private Environment env;

    private DataSource dataSource;

    private JpaProperties jpaProperties;

    @Autowired
    public JpaConfiguration(Environment environment, DataSource dataSource, JpaProperties jpaProperties) {
        this.env = environment;
        this.dataSource = dataSource;
        this.jpaProperties = jpaProperties;
    }

    @Bean
    public JpaVendorAdapter jpaVendorAdapter() {
        HibernateJpaVendorAdapter hibernateJpaVendorAdapter = new HibernateJpaVendorAdapter();
        hibernateJpaVendorAdapter.setShowSql(jpaProperties.getShowSql());
        hibernateJpaVendorAdapter.setGenerateDdl(true);
        hibernateJpaVendorAdapter.setDatabasePlatform(jpaProperties.getHibernate().getDialect());

        return hibernateJpaVendorAdapter;
    }

    @Bean
    public JpaDialect jpaDialect() {
        return new HibernateJpaDialect();
    }

    @Bean
    public SessionFactory sessionFactory(EntityManagerFactory entityManagerFactory) {
        if(entityManagerFactory.unwrap(SessionFactory.class) == null) {
            throw new NullPointerException("factory is not a hibernate factory");
        }
        return entityManagerFactory.unwrap(SessionFactory.class);
    }

    @Bean
    public HibernateTransactionManager transactionManager(SessionFactory sessionFactory) {
        HibernateTransactionManager jpaTransactionManager = new HibernateTransactionManager();
        jpaTransactionManager.setSessionFactory(sessionFactory);
        return jpaTransactionManager;
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        LocalContainerEntityManagerFactoryBean lef = new LocalContainerEntityManagerFactoryBean();
        lef.setDataSource(dataSource);
        lef.setJpaVendorAdapter(jpaVendorAdapter());
        lef.setJpaDialect(jpaDialect());
        lef.setMappingResources();
        // TODO: why is this needed here instead of annotation?
        lef.setPackagesToScan("fi.vm.sade.oppijanumerorekisteri.models");

        // TODO: maybe create separate entityManagerFactoryBean() with embedded profile
        String hbm2ddl = jpaProperties.getHibernate().getDdlAuto();
        if(Arrays.asList(env.getActiveProfiles()).contains("embedded")) {
            hbm2ddl = "create";
        }

        Properties props = new Properties();
        props.put("hibernate.show_sql", jpaProperties.getShowSql());
        props.put("hibernate.format_sql", jpaProperties.getFormatSql());
        props.put("hibernate.implicit_naming_strategy", jpaProperties.getHibernate().getImplicitNamingStrategy());
        props.put("hibernate.connection.charSet", jpaProperties.getConnection().getCharset());
        props.put("hibernate.current_session_context_class", jpaProperties.getCurrentSessionContextClass());
        props.put("hibernate.archive.autodetection", jpaProperties.getArchive().getAutodetection());
        props.put("hibernate.dialect", jpaProperties.getHibernate().getDialect());
        props.put("hibernate.hbm2ddl.auto", hbm2ddl);

        lef.setJpaProperties(props);
        lef.afterPropertiesSet();

        return lef;
    }
}
