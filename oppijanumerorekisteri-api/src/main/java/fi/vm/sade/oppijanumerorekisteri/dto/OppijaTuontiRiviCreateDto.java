package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAtLeastOneNotNull;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.*;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Collection;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OppijaTuontiRiviCreateDto {

    @ApiModelProperty("Lähdejärjestelmän käyttämä tunniste henkilölle")
    private String tunniste;

    @NotNull
    @Valid
    private OppijaTuontiRiviHenkiloCreateDto henkilo;

    @ApiModelProperty(hidden = true)
    private String henkiloOid;

    @ApiModelProperty(hidden = true)
    private String henkiloNimi;

    @ApiModelProperty(hidden = true)
    private boolean conflict;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @ValidateAtLeastOneNotNull({"oid", "hetu", "passinumero", "sahkoposti"})
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OppijaTuontiRiviHenkiloCreateDto {

        @Size(min = 1)
        private String oid;

        @ValidateHetu
        private String hetu;

        @Size(min = 1)
        private String passinumero;

        @Size(min = 1)
        @Email
        private String sahkoposti;

        @NotEmpty
        private String etunimet;

        @NotEmpty
        private String kutsumanimi;

        @NotEmpty
        private String sukunimi;

        private LocalDate syntymaaika;

        @ApiModelProperty("Koodisto 'sukupuoli'")
        @Valid
        private KoodiUpdateDto sukupuoli;

        @ApiModelProperty("Koodisto 'kieli'")
        @Valid
        private KoodiUpdateDto aidinkieli;

        @ApiModelProperty("Koodisto 'maatjavaltiot2'")
        @NotEmpty
        private Collection<@Valid @NotNull KoodiUpdateDto> kansalaisuus;
    }

}
