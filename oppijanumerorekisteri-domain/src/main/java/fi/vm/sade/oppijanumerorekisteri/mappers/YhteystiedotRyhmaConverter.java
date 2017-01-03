package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhmaAlkuperatieto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhmaKuvaus;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import ma.glasnost.orika.converter.BidirectionalConverter;
import ma.glasnost.orika.metadata.Type;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class YhteystiedotRyhmaConverter extends BidirectionalConverter<YhteystiedotRyhma, YhteystiedotRyhmaDto> {
    private OrikaConfiguration mapper;

    @Autowired
    public YhteystiedotRyhmaConverter(OrikaConfiguration mapper) {
        this.mapper = mapper;
    }

    @Override
    public YhteystiedotRyhmaDto convertTo(YhteystiedotRyhma source, Type<YhteystiedotRyhmaDto> destinationType) {
        return new YhteystiedotRyhmaDto(YhteystietoRyhmaKuvaus.forValue(source.getRyhmaKuvaus()),
                YhteystietoRyhmaAlkuperatieto.forValue(source.getRyhmaAlkuperaTieto()),
                source.isReadOnly(),
                source.getYhteystieto() == null ? null : this.mapper.mapAsSet(source.getYhteystieto(), YhteystietoDto.class));

    }

    @Override
    public YhteystiedotRyhma convertFrom(YhteystiedotRyhmaDto source, Type<YhteystiedotRyhma> destinationType) {
        return new YhteystiedotRyhma(null,
                source.getRyhmaKuvaus() == null ? null : source.getRyhmaKuvaus().getRyhmanKuvaus(),
                source.getRyhmaAlkuperaTieto() == null ? null : source.getRyhmaAlkuperaTieto().getAlkuperatieto(),
                source.isReadOnly(),
                source.getYhteystieto() == null ? null : this.mapper.mapAsSet(source.getYhteystieto(), Yhteystieto.class));
    }
}
