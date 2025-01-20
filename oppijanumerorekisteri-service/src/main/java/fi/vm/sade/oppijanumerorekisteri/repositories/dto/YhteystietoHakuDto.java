package fi.vm.sade.oppijanumerorekisteri.repositories.dto;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YhteystietoHakuDto implements Serializable {
    private String henkiloOid;
    private String ryhmaKuvaus;
    private String ryhmaAlkuperaTieto;
    private Boolean readOnly;
    private YhteystietoTyyppi yhteystietoTyyppi;
    private String arvo;
}
