package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaListDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.metadata.ClassMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OppijaMappers {

    @Bean
    public ClassMap<Henkilo, OppijaListDto> oppijaListDtoClassMap(MapperFactory mapperFactory) {
        return mapperFactory.classMap(Henkilo.class, OppijaListDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .toClassMap();
    }

    @Bean
    public ClassMap<Henkilo, OppijaReadDto> oppijaReadDtoClassMap(MapperFactory mapperFactory) {
        return mapperFactory.classMap(Henkilo.class, OppijaReadDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .toClassMap();
    }

}
