package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.*;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class YhteystiedotDto implements Serializable, WritableYhteystiedot, ReadableYhteystiedot {
    private final String alkupera;
    private final Boolean readOnly;
    private String sahkoposti;
    private String puhelinnumero;
    private String matkapuhelinnumero;
    private String katuosoite;
    private String kunta;
    private String postinumero;
    private String kaupunki;
    private String maa;
}
