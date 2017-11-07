package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.annotations.ApiModelProperty;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.Email;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijatCreateDto {

    @Email
    @ApiModelProperty(value = "Sähköposti, johon lähetetään hälytyksiä, kun virkailijalta tarvitaan toimenpiteitä")
    private String sahkoposti;

    @NotNull
    @Size(min = 1)
    @Valid
    private List<OppijaCreateDto> henkilot;

}
