package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOmattiedotDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import ma.glasnost.orika.CustomConverter;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.Type;
import org.springframework.stereotype.Component;

@Component
public class HenkiloOmattiedotDtoConverter extends CustomConverter<Henkilo, HenkiloOmattiedotDto> {
    @Override
    public HenkiloOmattiedotDto convert(Henkilo source, Type<? extends HenkiloOmattiedotDto> destinationType, MappingContext mappingContext) {
        HenkiloOmattiedotDto henkiloOmattiedotDto = new HenkiloOmattiedotDto();
        this.mapperFacade.map(source, henkiloOmattiedotDto);
        henkiloOmattiedotDto.setAsiointikieli(UserDetailsHelperImpl.getAsiointikieliOrDefault(source));
        henkiloOmattiedotDto.setKutsumanimi(UserDetailsHelperImpl.getKutsumanimiOrFirstEtunimi(source));
        return henkiloOmattiedotDto;
    }
}
