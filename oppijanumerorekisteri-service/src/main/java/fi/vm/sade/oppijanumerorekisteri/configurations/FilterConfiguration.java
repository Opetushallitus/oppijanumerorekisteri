package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.UrlHandlerFilter;

import fi.vm.sade.RequestCallerFilter;
import fi.vm.sade.RequestIdFilter;

@Configuration
public class FilterConfiguration {
    @Bean
    FilterRegistrationBean<RequestIdFilter> requestIdFilter() {
        var filter = new RequestIdFilter();
        var bean = new FilterRegistrationBean<>(filter);
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }

    @Bean
    FilterRegistrationBean<RequestCallerFilter> requestCallerFilter() {
        var filter = new RequestCallerFilter();
        var bean = new FilterRegistrationBean<>(filter);
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        return bean;
    }

    @Bean
    FilterRegistrationBean<UrlHandlerFilter> trailingSlashFilterRegistration() {
        var filter = UrlHandlerFilter.trailingSlashHandler("/**").wrapRequest().build();
        var bean = new FilterRegistrationBean<>(filter);
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE + 2);
        return bean;
    }
}
