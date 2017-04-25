package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloYhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloYhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoDto;
import java.util.LinkedHashMap;
import java.util.List;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import ma.glasnost.orika.CustomConverter;
import ma.glasnost.orika.metadata.Type;
import org.springframework.stereotype.Component;

@Component
public class HenkiloYhteystiedotDtoMapper extends CustomConverter<List<HenkiloYhteystietoDto>, List<HenkiloYhteystiedotDto>> {

    @Override
    public List<HenkiloYhteystiedotDto> convert(List<HenkiloYhteystietoDto> source, Type<? extends List<HenkiloYhteystiedotDto>> destinationType) {
        return source.stream()
                // ryhmitellään yhteystiedot henkilöittäin
                .collect(groupingBy(HenkiloYhteystietoDto::getOidHenkilo, LinkedHashMap::new, toList()))
                // palautetaan yksi rivi per henkilö + henkilön yhteystiedot
                .values().stream().map(this::toHenkilo).collect(toList());
    }

    private HenkiloYhteystiedotDto toHenkilo(List<HenkiloYhteystietoDto> source) {
        HenkiloYhteystiedotDto destination = mapperFacade.map(source.iterator().next(), HenkiloYhteystiedotDto.class);
        destination.setYhteystiedotRyhma(source.stream()
                .filter(t -> t.getYhteystietoRyhmaId() != null)
                // ryhmitelläänn henkilön yhteystiedot yhteystietoryhmittäin
                .collect(groupingBy(HenkiloYhteystietoDto::getYhteystietoRyhmaId))
                // palautetaan yksi rivi per yhteystietoryhmä
                .values().stream().map(this::toYhteystietoRyhma).collect(toList()));
        return destination;
    }

    private YhteystiedotRyhmaDto toYhteystietoRyhma(List<HenkiloYhteystietoDto> source) {
        YhteystiedotRyhmaDto destination = mapperFacade.map(source.iterator().next(), YhteystiedotRyhmaDto.class);
        destination.setId(source.iterator().next().getYhteystietoRyhmaId());
        destination.setYhteystieto(mapperFacade.mapAsSet(source.stream()
                .filter(t -> t.getYhteystietoArvo() != null && !t.getYhteystietoArvo().isEmpty())
                .collect(toList()), YhteystietoDto.class));
        return destination;
    }

}
