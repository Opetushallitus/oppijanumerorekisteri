package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import ma.glasnost.orika.CustomConverter;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.Type;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class HuoltajaCreateDtoConverter extends CustomConverter<HuoltajaCreateDto, Henkilo> {
    @Override
    public Henkilo convert(HuoltajaCreateDto source, Type<? extends Henkilo> destinationType, MappingContext mappingContext) {
        Henkilo henkilo = new Henkilo();
        this.mapperFacade.map(source, henkilo);
        Optional.of(source.getKansalaisuusKoodi())
                .map(kansalaisuusKoodis -> kansalaisuusKoodis.stream()
                        .map(Kansalaisuus::new)
                        .collect(Collectors.toSet()))
                .ifPresent(henkilo::setKansalaisuus);
        return henkilo;
    }
}
