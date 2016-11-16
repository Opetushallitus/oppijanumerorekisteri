package fi.vm.sade.oppijanumerorekisteri.mappers;

import ma.glasnost.orika.impl.DefaultMapperFactory;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.springframework.stereotype.Component;

@Component
public class OrikaConfiguration extends OrikaSpringMapper {
    @Override
    protected void configureFactoryBuilder(final DefaultMapperFactory.Builder factoryBuilder) {
        factoryBuilder.mapNulls(false);
        super.configureFactoryBuilder(factoryBuilder);
    }
}
