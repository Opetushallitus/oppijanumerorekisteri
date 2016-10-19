package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class YhteystiedotDto implements Serializable, WritableYhteystiedot, ReadableYhteystiedot {
    private String sahkoposti;
    private String puhelinnumero;
    private String matkapuhelinnumero;
    private String katuosoite;
    private String kunta;
    private String postinumero;
    private String kaupunki;
    private String maa;
}
