package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import ma.glasnost.orika.CustomConverter;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.Type;
import org.springframework.stereotype.Component;

@Component
public class HenkiloDuplicateDtoConverter extends CustomConverter<Henkilo, HenkiloDuplicateDto> {

    @Override
    public HenkiloDuplicateDto convert(Henkilo henkilos,
                                       Type<? extends HenkiloDuplicateDto> type,
                                       MappingContext mappingContext) {
        HenkiloDuplicateDto henkiloDuplicateDto = new HenkiloDuplicateDto();
        this.mapperFacade.map(henkilos, henkiloDuplicateDto);
        henkiloDuplicateDto.setYksiloity(henkilos.isYksiloity() || henkilos.isYksiloityVTJ());
        return henkiloDuplicateDto;
    }
}
