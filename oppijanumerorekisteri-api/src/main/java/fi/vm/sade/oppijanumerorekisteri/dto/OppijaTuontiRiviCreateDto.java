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

        private String oid;

        @ValidateHetu
        private String hetu;

        private String passinumero;

        @Email
        private String sahkoposti;

        @NotNull
        private String etunimet;

        @NotNull
        private String kutsumanimi;

        @NotNull
        private String sukunimi;

        private LocalDate syntymaaika;

        @ApiModelProperty("Koodisto 'sukupuoli'")
        private KoodiUpdateDto sukupuoli;

        @ApiModelProperty("Koodisto 'kieli'")
        private KoodiUpdateDto aidinkieli;

        @ApiModelProperty("Koodisto 'maatjavaltiot2'")
        @NotEmpty
        private Collection<@Valid @NotNull KoodiUpdateDto> kansalaisuus;

    }

}
