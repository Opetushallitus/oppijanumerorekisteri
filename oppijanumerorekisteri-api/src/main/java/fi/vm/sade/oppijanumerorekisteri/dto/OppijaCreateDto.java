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

    @NotEmpty
    private String etunimet;

    @NotEmpty
    private String kutsumanimi;

    @NotEmpty
    private String sukunimi;

    // mahdollistaa hetuttoman yksilöinnin luonnin yhteydessä
    private boolean yksiloity;

    @NotNull
    private LocalDate syntymaaika;

    @ApiModelProperty(value = "Koodisto: 'sukupuoli'", required = true)
    @NotEmpty
    private String sukupuoli;

    @Valid
    private KielisyysDto aidinkieli;

    @Valid
    @NotEmpty
    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<String> passinumerot = new HashSet<>();

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();

}
