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
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaCreateDto {

    @Schema(requiredMode = RequiredMode.REQUIRED)
    @NotEmpty
    private String etunimet;

    @Schema(requiredMode = RequiredMode.REQUIRED)
    @NotEmpty
    private String kutsumanimi;

    @Schema(requiredMode = RequiredMode.REQUIRED)
    @NotEmpty
    private String sukunimi;

    // mahdollistaa hetuttoman yksilöinnin luonnin yhteydessä
    private boolean yksiloity;

    @Schema(requiredMode = RequiredMode.REQUIRED)
    @NotNull
    private LocalDate syntymaaika;

    @Schema(description = "Koodisto: 'sukupuoli'", requiredMode = RequiredMode.REQUIRED)
    @NotEmpty
    private String sukupuoli;

    @Schema(requiredMode = RequiredMode.REQUIRED)
    @Valid
    private KielisyysDto aidinkieli;

    @Schema(requiredMode = RequiredMode.REQUIRED)
    @Valid
    @NotEmpty
    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<String> passinumerot = new HashSet<>();

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();

}
