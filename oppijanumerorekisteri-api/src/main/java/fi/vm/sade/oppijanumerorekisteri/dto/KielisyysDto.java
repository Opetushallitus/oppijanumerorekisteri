package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.*;

import javax.validation.constraints.NotEmpty;
import java.io.Serializable;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KielisyysDto implements Serializable {
    private static final long serialVersionUID = 7217945009330980201L;

    @ApiModelProperty(required = true)
    @NotEmpty
    private String kieliKoodi;

    private String kieliTyyppi;
}
