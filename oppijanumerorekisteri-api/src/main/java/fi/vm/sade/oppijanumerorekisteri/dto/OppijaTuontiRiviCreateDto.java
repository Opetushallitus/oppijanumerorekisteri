package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAtLeastOneNotNull;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import io.swagger.annotations.ApiModelProperty;
import lombok.Setter;
import lombok.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

        @ApiModelProperty(value = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @Size(min = 1)
        private String oid;

        @ApiModelProperty(value = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @ValidateHetu
        private String hetu;

        @ApiModelProperty(value = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @Size(min = 1)
        private String passinumero;

        @ApiModelProperty(value = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @Size(min = 1)
        @Email
        private String sahkoposti;

        @ApiModelProperty(required = true)
        @NotEmpty
        private String etunimet;

        @ApiModelProperty(value = "Kutsumanimen tulee olla yksi etunimistä", required = true)
        @NotEmpty
        private String kutsumanimi;

        @ApiModelProperty(required = true)
        @NotEmpty
        private String sukunimi;

        private LocalDate syntymaaika;

        @ApiModelProperty("Koodisto 'sukupuoli'")
        @Valid
        private KoodiUpdateDto sukupuoli;

        @ApiModelProperty("Koodisto 'kieli'")
        @Valid
        private KoodiUpdateDto aidinkieli;

        @ApiModelProperty(value = "Koodisto 'maatjavaltiot2'", required = true)
        @NotEmpty
        private Collection<@Valid @NotNull KoodiUpdateDto> kansalaisuus;
    }

}
