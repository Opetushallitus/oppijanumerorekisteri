package fi.vm.sade.oppijanumerorekisteri.dto;

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

    @NotEmpty
    private String kieliKoodi;

    @NotEmpty
    private String kieliTyyppi;
}
