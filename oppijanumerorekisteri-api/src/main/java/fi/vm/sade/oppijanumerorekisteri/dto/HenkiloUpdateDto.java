package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// NOTE: Since this works like patch is initialising null to all fields reasonable to prevent accidental list overrides
public class HenkiloUpdateDto {
    private String oidHenkilo;

    private Boolean passivoitu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    @ValidateHetu
    private String hetu;

    private LocalDate syntymaaika;

    private LocalDate kuolinpaiva;

    private String sukupuoli;

    private String kotikunta;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private KielisyysDto aidinkieli;

    private Set<KansalaisuusDto> kansalaisuus = null;

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = null;
}
