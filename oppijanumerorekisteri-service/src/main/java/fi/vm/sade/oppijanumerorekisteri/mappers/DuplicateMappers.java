package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.ClassMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DuplicateMappers {

    @Bean
    public ClassMap<Henkilo, HenkiloDuplicateDto> henkiloToDuplicate(MapperFactory mapperFactory) {
        return mapperFactory.classMap(Henkilo.class, HenkiloDuplicateDto.class)
                .byDefault()
                .customize(new CustomMapper<>() {
                    @Override
                    public void mapAtoB(Henkilo henkilo, HenkiloDuplicateDto duplicate, MappingContext context) {
                        String email = henkilo.getYhteystiedotRyhma().stream()
                                .flatMap(group -> group.getYhteystieto().stream())
                                .filter(info -> info.getYhteystietoTyyppi() == YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI)
                                .filter(info -> !info.getYhteystietoArvo().isEmpty())
                                .findFirst()
                                .map(info -> info.getYhteystietoArvo())
                                .orElse(null);
                        duplicate.setEmail(email);
                    }
                })
                .toClassMap();
    }

}

