package fi.vm.sade.oppijanumerorekisteri.mappers;

import ma.glasnost.orika.converter.builtin.PassThroughConverter;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Orika-konfiguraatio {@link LocalDate}:lle.
 */
@Component
public class LocalDateConverter extends PassThroughConverter {

    public LocalDateConverter() {
        super(LocalDate.class);
    }

}
