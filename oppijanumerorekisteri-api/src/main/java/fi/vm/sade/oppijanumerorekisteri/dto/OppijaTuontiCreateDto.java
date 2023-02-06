package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.*;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaTuontiCreateDto {

    @Size(min = 1)
    @Email
    @ApiModelProperty(value = "Sähköposti, johon lähetetään hälytyksiä, kun virkailijalta tarvitaan toimenpiteitä")
    private String sahkoposti;

    @NotEmpty
    @Valid
    @ApiModelProperty(required = true)
    private List<OppijaTuontiRiviCreateDto> henkilot;

}
