package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YhteystietoDto implements Serializable {
    private static final long serialVersionUID = 4785135498967497621L;

    @NotNull
    private YhteystietoTyyppi yhteystietoTyyppi;

    private String yhteystietoArvo;

}
