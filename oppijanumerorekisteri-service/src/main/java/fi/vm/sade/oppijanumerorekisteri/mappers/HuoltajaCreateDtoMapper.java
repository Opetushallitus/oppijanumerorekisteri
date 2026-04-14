package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.utils.YhteystietoryhmaUtils;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import dev.akkinoc.spring.boot.orika.OrikaMapperFactoryConfigurer;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class HuoltajaCreateDtoMapper implements OrikaMapperFactoryConfigurer {
    @Autowired
    KansalaisuusRepository kansalaisuusRepository;

    @Override
    public void configure(MapperFactory orikaMapperFactory) {
        orikaMapperFactory.classMap(HuoltajaCreateDto.class, Henkilo.class)
                .exclude("yhteystiedotRyhma")
                .byDefault()
                .customize(new CustomMapper<HuoltajaCreateDto, Henkilo>() {
                    @Override
                    public void mapAtoB(HuoltajaCreateDto huoltajaCreateDto, Henkilo henkilo, MappingContext context) {
                        YhteystietoryhmaUtils.updateYhteystiedot(huoltajaCreateDto.getYhteystiedotRyhma(), henkilo.getYhteystiedotRyhma(), true);
                        Optional.ofNullable(huoltajaCreateDto.getKansalaisuusKoodi())
                                .map(kansalaisuusKoodis -> kansalaisuusKoodis.stream()
                                        .map(kansalaisuusKoodi -> kansalaisuusRepository.findByKansalaisuusKoodi(kansalaisuusKoodi)
                                                .orElse(null))
                                        .filter((k) -> k != null)
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
                .register();

        orikaMapperFactory.classMap(HenkiloHuoltajaSuhde.class, HuoltajaCreateDto.class)
                .byDefault()
                .customize(new CustomMapper<HenkiloHuoltajaSuhde, HuoltajaCreateDto>() {
                    @Override
                    public void mapAtoB(HenkiloHuoltajaSuhde henkiloHuoltajaSuhde, HuoltajaCreateDto huoltajaCreateDto, MappingContext context) {
                        mapperFacade.map(henkiloHuoltajaSuhde.getHuoltaja(), huoltajaCreateDto);
                    }
                })
                .register();
    }
}
