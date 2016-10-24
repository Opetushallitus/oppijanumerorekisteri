package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class KansalaisuusDto implements Serializable {
    private static final long serialVersionUID = -1616181528688301217L;

    private String kansalaisuuskoodi;
}
