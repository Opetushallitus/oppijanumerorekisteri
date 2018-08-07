package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiVirheDto;
import fi.vm.sade.oppijanumerorekisteri.enums.YksilointivirheTila;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointivirhe;
import ma.glasnost.orika.CustomConverter;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.Type;
import org.springframework.stereotype.Component;

@Component
public class YksilointivirheDtoMapper extends CustomConverter<Yksilointivirhe, YksilointiVirheDto> {

    @Override
    public YksilointiVirheDto convert(Yksilointivirhe source,
                                      Type<? extends YksilointiVirheDto> destinationType,
                                      MappingContext mappingContext) {
        YksilointiVirheDto yksilointiVirheDto = new YksilointiVirheDto();
        this.mapperFacade.map(source, yksilointiVirheDto);

        YksilointivirheTila yksilointivirheTila;
        if ("fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException".equals(source.getPoikkeus())) {
            if (source.getViesti().startsWith("Henkilöä ei löytynyt VTJ-palvelusta henkilötunnuksella: ")) {
                yksilointivirheTila = YksilointivirheTila.HETU_EI_VTJ;
            }
            else if (source.getViesti().startsWith("Henkilön hetu ei ole oikea: ")) {
                yksilointivirheTila = YksilointivirheTila.HETU_EI_OIKEA;
            }
            else {
                yksilointivirheTila = YksilointivirheTila.MUU;
            }
        }
        else {
            yksilointivirheTila = YksilointivirheTila.MUU_UUDELLEENYRITETTAVA;
        }
        yksilointiVirheDto.setYksilointivirheTila(yksilointivirheTila);

        return yksilointiVirheDto;
    }
}
