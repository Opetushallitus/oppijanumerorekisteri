package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YhteystiedotDto implements Serializable, WritableYhteystiedot, ReadableYhteystiedot {
    private String alkupera;
    private Boolean readOnly;
    private String sahkoposti;
    private String puhelinnumero;
    private String matkapuhelinnumero;
    private String katuosoite;
    private String kunta;
    private String postinumero;
    private String kaupunki;
    private String maa;

    public YhteystiedotDto(String alkupera, Boolean readOnly) {
        this.alkupera = alkupera;
        this.readOnly = readOnly;
    }

}
