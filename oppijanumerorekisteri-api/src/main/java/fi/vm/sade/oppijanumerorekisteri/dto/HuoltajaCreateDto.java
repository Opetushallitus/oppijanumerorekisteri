package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.Setter;
import lombok.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
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

    private String kutsumanimi;

    private String sukunimi;

    private LocalDate syntymaaika;

    private Boolean yksiloityVTJ;

    // Valtiot ja maat 2 koodisto
    private Set<String> kansalaisuusKoodi;

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma;

    private LocalDate huoltajuusAlku;

    private LocalDate huoltajuusLoppu;
}
