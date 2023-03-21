package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.*;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaCreateDto {

    @ApiModelProperty(required = true)
    @NotEmpty
    private String etunimet;

    @ApiModelProperty(required = true)
    @NotEmpty
    private String kutsumanimi;

    @ApiModelProperty(required = true)
    @NotEmpty
    private String sukunimi;

    // mahdollistaa hetuttoman yksilöinnin luonnin yhteydessä
    private boolean yksiloity;

    @ApiModelProperty(required = true)
    @NotNull
    private LocalDate syntymaaika;

    @ApiModelProperty(value = "Koodisto: 'sukupuoli'", required = true)
    @NotEmpty
    private String sukupuoli;

    @ApiModelProperty(required = true)
    @Valid
    private KielisyysDto aidinkieli;

    @ApiModelProperty(required = true)
    @Valid
    @NotEmpty
    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<String> passinumerot = new HashSet<>();

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();

}
