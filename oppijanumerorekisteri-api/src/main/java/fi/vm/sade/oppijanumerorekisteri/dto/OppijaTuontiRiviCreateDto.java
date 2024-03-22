package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAtLeastOneNotNull;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import io.swagger.v3.oas.annotations.media.Schema;
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

    @Schema(description = "Lähdejärjestelmän käyttämä tunniste henkilölle")
    private String tunniste;

    @NotNull
    @Valid
    private OppijaTuontiRiviHenkiloCreateDto henkilo;

    @Schema(hidden = true)
    private String henkiloOid;

    @Schema(hidden = true)
    private String henkiloNimi;

    @Schema(hidden = true)
    private boolean conflict;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @ValidateAtLeastOneNotNull({"oid", "hetu", "passinumero", "sahkoposti"})
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OppijaTuontiRiviHenkiloCreateDto {

        @Schema(description = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @Size(min = 1)
        private String oid;

        @Schema(description = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @ValidateHetu
        private String hetu;

        @Schema(description = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @Size(min = 1)
        private String passinumero;

        @Schema(description = "Vähintään yksi yksilöivä tunniste vaaditaan", required = true)
        @Size(min = 1)
        @Email
        private String sahkoposti;

        @Schema(required = true)
        @NotEmpty
        private String etunimet;

        @Schema(description = "Kutsumanimen tulee olla yksi etunimistä", required = true)
        @NotEmpty
        private String kutsumanimi;

        @Schema(required = true)
        @NotEmpty
        private String sukunimi;

        private LocalDate syntymaaika;

        @Schema(description = "Koodisto 'sukupuoli'")
        @Valid
        private KoodiUpdateDto sukupuoli;

        @Schema(description = "Koodisto 'kieli'")
        @Valid
        private KoodiUpdateDto aidinkieli;

        @Schema(description = "Koodisto 'maatjavaltiot2'", required = true)
        @NotEmpty
        private Collection<@Valid @NotNull KoodiUpdateDto> kansalaisuus;
    }

}
