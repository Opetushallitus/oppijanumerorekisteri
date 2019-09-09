package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.utils.YhteystietoryhmaUtils;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.ClassMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.stream.Collectors;

@Configuration
public class HuoltajaCreateDtoMapper {

    @Bean
    public ClassMap<HuoltajaCreateDto, Henkilo> huoltajaCreateDtoHenkiloClassMap(MapperFactory mapperFactory, KansalaisuusRepository kansalaisuusRepository, OrikaConfiguration mapper) {
        return mapperFactory.classMap(HuoltajaCreateDto.class, Henkilo.class)
                .exclude("yhteystiedotRyhma")
                .byDefault()
                .customize(new CustomMapper<HuoltajaCreateDto, Henkilo>() {
                    @Override
                    public void mapAtoB(HuoltajaCreateDto huoltajaCreateDto, Henkilo henkilo, MappingContext context) {
                        YhteystietoryhmaUtils.updateYhteystiedot(huoltajaCreateDto.getYhteystiedotRyhma(), henkilo.getYhteystiedotRyhma(), true, mapper);

                        Optional.ofNullable(huoltajaCreateDto.getKansalaisuusKoodi())
                                .map(kansalaisuusKoodis -> kansalaisuusKoodis.stream()
                                        .map(kansalaisuusKoodi -> kansalaisuusRepository.findByKansalaisuusKoodi(kansalaisuusKoodi)
                                                .orElseGet(() -> kansalaisuusRepository.save(new Kansalaisuus(kansalaisuusKoodi))))
                                        .collect(Collectors.toSet()))
                                .ifPresent(henkilo::setKansalaisuus);
                        if ("".equals(huoltajaCreateDto.getHetu())) {
                            huoltajaCreateDto.setHetu(null);
                        }
                        if (StringUtils.hasLength(huoltajaCreateDto.getHetu())) {
                            henkilo.setSyntymaaika(HetuUtils.dateFromHetu(huoltajaCreateDto.getHetu()));
                            henkilo.setSukupuoli(HetuUtils.sukupuoliFromHetu(huoltajaCreateDto.getHetu()));
                        }
                    }
                })
                .toClassMap();
    }

    @Bean
    public ClassMap<HenkiloHuoltajaSuhde, HuoltajaCreateDto> henkiloHuoltajaSuhdeHuoltajaCreateDtoClassMap(MapperFactory mapperFactory) {
        return mapperFactory.classMap(HenkiloHuoltajaSuhde.class, HuoltajaCreateDto.class)
                .byDefault()
                .customize(new CustomMapper<HenkiloHuoltajaSuhde, HuoltajaCreateDto>() {
                    @Override
                    public void mapAtoB(HenkiloHuoltajaSuhde henkiloHuoltajaSuhde, HuoltajaCreateDto huoltajaCreateDto, MappingContext context) {
                        mapperFacade.map(henkiloHuoltajaSuhde.getHuoltaja(), huoltajaCreateDto);
                    }
                })
                .toClassMap();
    }

}
