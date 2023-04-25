package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.*;

import javax.validation.constraints.NotEmpty;
import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KansalaisuusDto implements Serializable {
    private static final long serialVersionUID = -1616181528688301217L;

    @ApiModelProperty(required = true)
    @NotEmpty
    private String kansalaisuusKoodi;
}
