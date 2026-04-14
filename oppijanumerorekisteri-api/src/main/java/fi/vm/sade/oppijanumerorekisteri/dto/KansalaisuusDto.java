package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import lombok.Setter;
import lombok.*;

import jakarta.validation.constraints.NotEmpty;
import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KansalaisuusDto implements Serializable {
    private static final long serialVersionUID = -1616181528688301217L;

    @Schema(requiredMode = RequiredMode.REQUIRED)
    @NotEmpty
    private String kansalaisuusKoodi;
}
