package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaCreateDto {

    @Schema(required = true)
    @NotEmpty
    private String etunimet;

    @Schema(required = true)
    @NotEmpty
    private String kutsumanimi;

    @Schema(required = true)
    @NotEmpty
    private String sukunimi;

    // mahdollistaa hetuttoman yksilöinnin luonnin yhteydessä
    private boolean yksiloity;

    @Schema(required = true)
    @NotNull
    private LocalDate syntymaaika;

    @Schema(description = "Koodisto: 'sukupuoli'", required = true)
    @NotEmpty
    private String sukupuoli;

    @Schema(required = true)
    @Valid
    private KielisyysDto aidinkieli;

    @Schema(required = true)
    @Valid
    @NotEmpty
    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<String> passinumerot = new HashSet<>();

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();

}
