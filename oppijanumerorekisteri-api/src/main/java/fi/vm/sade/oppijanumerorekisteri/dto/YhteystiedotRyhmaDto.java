package fi.vm.sade.oppijanumerorekisteri.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YhteystiedotRyhmaDto implements Serializable {
    private static final long serialVersionUID = 7820975061439666995L;

    private Long id;

    /**
     * Koodisto "yhteystietotyypit".
     */
    @ApiModelProperty("Koodisto 'yhteystietotyypit'")
    private String ryhmaKuvaus;

    /**
     * Koodisto "yhteystietojenalkupera".
     */
    @NotNull
    @ApiModelProperty("Koodisto 'yhteystietojenalkupera'")
    private String ryhmaAlkuperaTieto;

    private boolean readOnly;

    @Valid
    @Singular(value = "yhteystieto")
    private Set<YhteystietoDto> yhteystieto = new HashSet<>();

}
