package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Setter;
import lombok.*;

import jakarta.validation.constraints.NotEmpty;
import java.io.Serializable;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KielisyysDto implements Serializable {
    private static final long serialVersionUID = 7217945009330980201L;

    @Schema(required = true)
    @NotEmpty
    private String kieliKoodi;

    private String kieliTyyppi;
}
