package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.metadata.ClassMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OppijaMappers {

    @Bean
    public ClassMap<Henkilo, OppijaReadDto.HenkiloReadDto> oppijaReadDtoClassMap(MapperFactory mapperFactory) {
        return mapperFactory.classMap(Henkilo.class, OppijaReadDto.HenkiloReadDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .toClassMap();
    }

}
