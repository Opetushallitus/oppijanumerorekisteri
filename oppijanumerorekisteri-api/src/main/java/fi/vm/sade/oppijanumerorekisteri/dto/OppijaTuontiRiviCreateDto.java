package fi.vm.sade.oppijanumerorekisteri.dto;

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
public class OppijaTuontiRiviCreateDto {

    @ApiModelProperty("Lähdejärjestelmän käyttämä tunniste henkilölle")
    private String tunniste;

    @NotNull
    @Valid
    private OppijaTuontiRiviHenkiloCreateDto henkilo;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @ValidateAtLeastOneNotNull({"oid", "hetu", "passinumero", "sahkoposti"})
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
