package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class YhteystietoDto implements Serializable {
    private static final long serialVersionUID = 4785135498967497621L;

    private YhteystietoTyyppi yhteystietoTyyppi;

    private String yhteystietoArvo;

}
