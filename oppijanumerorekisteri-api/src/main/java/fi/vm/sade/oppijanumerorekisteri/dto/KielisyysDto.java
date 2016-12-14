package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Pattern;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class KielisyysDto implements Serializable {
    private static final long serialVersionUID = 7217945009330980201L;

    private String kieliKoodi;

    private String kieliTyyppi;
}
