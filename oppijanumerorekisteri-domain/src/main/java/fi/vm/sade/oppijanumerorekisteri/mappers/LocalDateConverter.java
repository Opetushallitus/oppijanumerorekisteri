package fi.vm.sade.oppijanumerorekisteri.mappers;

import java.time.LocalDate;
import ma.glasnost.orika.converter.builtin.PassThroughConverter;
import org.springframework.stereotype.Component;

/**
 * Orika-konfiguraatio {@link LocalDate}:lle.
 */
@Component
public class LocalDateConverter extends PassThroughConverter {

    public LocalDateConverter() {
        super(LocalDate.class);
    }

}
