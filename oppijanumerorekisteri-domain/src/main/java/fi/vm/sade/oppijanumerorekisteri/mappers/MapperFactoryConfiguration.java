package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.impl.DefaultMapperFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperFactoryConfiguration {
    @Bean
    MapperFactory mapperFactory() {
        final DefaultMapperFactory.Builder factoryBuilder = new DefaultMapperFactory.Builder();
        return factoryBuilder.mapNulls(false).build();
    }
}
