package fi.vm.sade.oppijanumerorekisteri.mappers;

import dev.akkinoc.spring.boot.orika.OrikaMapperFactoryConfigurer;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOmattiedotDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import ma.glasnost.orika.MapperFactory;
import org.springframework.stereotype.Component;

@Component
public class HenkiloOmattiedotDtoMapper implements OrikaMapperFactoryConfigurer {
    @Override
    public void configure(MapperFactory orikaMapperFactory) {
        orikaMapperFactory.classMap(Henkilo.class, HenkiloOmattiedotDto.class)
                // Service language is asiointiKieli in Henkilo and asiointikieli in HenkiloOmattiedotDto
                // which causes issues with mapping.
                .field("asiointiKieli.kieliKoodi", "asiointikieli")
                .byDefault()
                .register();
    }
}
