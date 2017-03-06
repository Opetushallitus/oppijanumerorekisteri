package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.models.ExternalId;
import ma.glasnost.orika.converter.BidirectionalConverter;
import ma.glasnost.orika.metadata.Type;
import org.springframework.stereotype.Component;

/**
 * Orika-konfiguraatio {@link ExternalId}:lle.
 */
@Component
public class ExternalIdConverter extends BidirectionalConverter<ExternalId, String> {

    @Override
    public String convertTo(ExternalId source, Type<String> destinationType) {
        return source.getExternalid();
    }

    @Override
    public ExternalId convertFrom(String source, Type<ExternalId> destinationType) {
        ExternalId externalId = new ExternalId();
        externalId.setExternalid(source);
        return externalId;
    }

}
