package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Setter;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaTuontiRiviReadDto {

    @Schema(description = "Lähdejärjestelmän käyttämä tunniste henkilölle")
    private String tunniste;

    private OppijaReadDto henkilo;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean conflict;
}
