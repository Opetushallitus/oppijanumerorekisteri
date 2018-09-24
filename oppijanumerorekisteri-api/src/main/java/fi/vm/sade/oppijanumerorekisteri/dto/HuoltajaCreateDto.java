package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.*;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Set;

/**
 * Henkilön tiedot hetullisesta tai hetuttomasta huoltajasta. Hetullisella on vain hetu-tieto huoltajuustyypin lisäksi.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HuoltajaCreateDto {
    @ValidateHetu
    private String hetu;

    private String etunimet;

    private String sukunimi;

    private LocalDate syntymaaika;

    // Valtiot ja maat 2 koodisto
    private Set<String> kansalaisuusKoodi;

    // Huoltajuustyyppi koodisto
    @NotNull
    private String huoltajuustyyppiKoodi;

    public String getKutsumanimi() {
        return etunimet == null
                ? null
                : Arrays.stream(etunimet.split(" "))
                .findFirst()
                .orElse(null);
    }
}
