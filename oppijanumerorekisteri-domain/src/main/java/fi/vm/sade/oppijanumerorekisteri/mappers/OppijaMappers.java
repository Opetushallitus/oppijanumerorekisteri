package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaMuutosDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.metadata.ClassMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OppijaMappers {

    @Bean
    public ClassMap<Henkilo, OppijaTuontiRiviReadDto.OppijaTuontiRiviHenkiloReadDto> oppijaReadDtoClassMap(MapperFactory mapperFactory) {
        return mapperFactory.classMap(Henkilo.class, OppijaTuontiRiviReadDto.OppijaTuontiRiviHenkiloReadDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .toClassMap();
    }

    @Bean
    public ClassMap<Henkilo, OppijaMuutosDto> oppijaMuutosDtoClassMap(MapperFactory mapperFactory) {
        return mapperFactory.classMap(Henkilo.class, OppijaMuutosDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .toClassMap();
    }

}
