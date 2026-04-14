package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaListDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiVirheDto;
import fi.vm.sade.oppijanumerorekisteri.enums.YksilointivirheTila;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointivirhe;
import ma.glasnost.orika.CustomConverter;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.Type;
import org.springframework.stereotype.Component;

import dev.akkinoc.spring.boot.orika.OrikaMapperFactoryConfigurer;

@Component
public class YksilointivirheDtoMapper implements OrikaMapperFactoryConfigurer {
    @Override
    public void configure(MapperFactory orikaMapperFactory) {
        orikaMapperFactory.classMap(Yksilointivirhe.class, YksilointiVirheDto.class)
                .byDefault()
                .customize(new CustomMapper<Yksilointivirhe, YksilointiVirheDto>() {
                    @Override
                    public void mapAtoB(Yksilointivirhe yksilointivirhe, YksilointiVirheDto yksilointiVirheDto, MappingContext context) {
                        YksilointivirheTila yksilointivirheTila;
                        if ("fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException".equals(yksilointivirhe.getPoikkeus())) {
                            if (yksilointivirhe.getViesti().startsWith("Henkilöä ei löytynyt VTJ-palvelusta henkilötunnuksella: ")) {
                                yksilointivirheTila = YksilointivirheTila.HETU_EI_VTJ;
                            }
                            else if (yksilointivirhe.getViesti().startsWith("Henkilön hetu ei ole oikea: ")) {
                                yksilointivirheTila = YksilointivirheTila.HETU_EI_OIKEA;
                            }
                            else if (yksilointivirhe.getViesti().contains("Henkilön hetu on passivoitu: ")) {
                                yksilointivirheTila = YksilointivirheTila.HETU_PASSIVOITU;
                            }
                            else {
                                yksilointivirheTila = YksilointivirheTila.MUU;
                            }
                        } else {
                            yksilointivirheTila = YksilointivirheTila.MUU_UUDELLEENYRITETTAVA;
                        }
                        yksilointiVirheDto.setYksilointivirheTila(yksilointivirheTila);
                    }
                })
                .register();
    }
}
