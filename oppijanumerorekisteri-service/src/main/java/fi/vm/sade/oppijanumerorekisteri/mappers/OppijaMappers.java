package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.dto.KoodiNimiReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaListDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.utils.KoodistoUtils;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;
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
    public ClassMap<Henkilo, OppijaReadDto> oppijaReadDtoClassMap(MapperFactory mapperFactory, KoodistoService koodistoService) {
        return mapperFactory.classMap(Henkilo.class, OppijaReadDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .customize(new CustomMapper<Henkilo, OppijaReadDto>() {
                    @Override
                    public void mapAtoB(Henkilo henkilo, OppijaReadDto oppijaReadDto, MappingContext context) {
                        if (henkilo.getKotikunta() != null) {
                            Iterable<KoodiType> koodit = koodistoService.list(Koodisto.KUNTA);
                            KoodiNimiReadDto kotikunta = KoodistoUtils.getKoodiNimiReadDto(koodit, henkilo.getKotikunta());
                            oppijaReadDto.setKotikunta(kotikunta);
                        }
                    }
                })
                .toClassMap();
    }

}
