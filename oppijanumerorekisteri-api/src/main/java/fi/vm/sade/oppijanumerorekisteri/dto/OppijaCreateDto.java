package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OppijaCreateDto {

    @NotNull
    @Size(min = 1)
    private String etunimet;

    @NotNull
    @Size(min = 1)
    private String kutsumanimi;

    @NotNull
    @Size(min = 1)
    private String sukunimi;

    // mahdollistaa hetuttoman yksilöinnin luonnin yhteydessä
    private boolean yksiloity;

    private LocalDate syntymaaika;

    private String sukupuoli;

    private KielisyysDto aidinkieli;

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<String> passinumerot = new HashSet<>();

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();

}
