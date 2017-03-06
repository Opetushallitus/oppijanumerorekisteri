package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import lombok.Builder;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YhteystietoDto implements Serializable {
    private static final long serialVersionUID = 4785135498967497621L;

    private YhteystietoTyyppi yhteystietoTyyppi;

    private String yhteystietoArvo;

}
