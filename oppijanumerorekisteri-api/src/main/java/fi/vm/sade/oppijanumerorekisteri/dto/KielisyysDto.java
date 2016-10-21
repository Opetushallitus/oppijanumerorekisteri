package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class KielisyysDto implements Serializable {
    private static final long serialVersionUID = 7217945009330980201L;

    private String kielikoodi;

    private String kielityyppi;
}
