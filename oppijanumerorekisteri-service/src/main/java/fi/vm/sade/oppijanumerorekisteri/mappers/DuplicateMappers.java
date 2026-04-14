package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;
import org.springframework.stereotype.Component;

import dev.akkinoc.spring.boot.orika.OrikaMapperFactoryConfigurer;

import java.util.List;
import java.util.Objects;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Component
public class DuplicateMappers implements OrikaMapperFactoryConfigurer {
    @Override
    public void configure(MapperFactory orikaMapperFactory) {
        orikaMapperFactory.classMap(Henkilo.class, HenkiloDuplicateDto.class)
                .byDefault()
                .customize(new CustomMapper<>() {
                    @Override
                    public void mapAtoB(Henkilo henkilo, HenkiloDuplicateDto duplicate, MappingContext context) {
                        List<String> emails = henkilo.getYhteystiedotRyhma().stream()
                                .flatMap(group -> group.getYhteystieto().stream())
                                .filter(info -> info.getYhteystietoTyyppi() == YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI)
                                .map(Yhteystieto::getYhteystietoArvo)
                                .filter(Objects::nonNull)
                                .filter(Predicate.not(String::isBlank))
                                .collect(Collectors.toList());
                        duplicate.setEmails(emails);
                        duplicate.setYksiloity(henkilo.isYksiloityWithAnyMethod());
                    }
                })
                .register();
    }
}

