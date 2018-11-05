package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.ClassMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;
import java.util.stream.Collectors;

@Configuration
public class HuoltajaCreateDtoMapper {

    @Bean
    public ClassMap<HuoltajaCreateDto, Henkilo> huoltajaCreateDtoHenkiloClassMap(MapperFactory mapperFactory, KansalaisuusRepository kansalaisuusRepository) {
        return mapperFactory.classMap(HuoltajaCreateDto.class, Henkilo.class)
                .byDefault()
                .customize(new CustomMapper<HuoltajaCreateDto, Henkilo>() {
                    @Override
                    public void mapAtoB(HuoltajaCreateDto huoltajaCreateDto, Henkilo henkilo, MappingContext context) {
                        Optional.ofNullable(huoltajaCreateDto.getKansalaisuusKoodi())
                                .map(kansalaisuusKoodis -> kansalaisuusKoodis.stream()
                                        .map(kansalaisuusKoodi -> kansalaisuusRepository.findByKansalaisuusKoodi(kansalaisuusKoodi)
                                                .orElseGet(() -> kansalaisuusRepository.save(new Kansalaisuus(kansalaisuusKoodi))))
                                        .collect(Collectors.toSet()))
                                .ifPresent(henkilo::setKansalaisuus);
                        if ("".equals(huoltajaCreateDto.getHetu())) {
                            huoltajaCreateDto.setHetu(null);
                        }
                    }
                })
                .toClassMap();
    }
}
