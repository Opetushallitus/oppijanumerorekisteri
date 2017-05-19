package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloUpdateDto {
    private String oidHenkilo;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    @ValidateHetu
    private String hetu;

    private LocalDate syntymaaika;

    private String sukupuoli;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private KielisyysDto aidinkieli;

    private Set<KielisyysDto> kielisyys = new HashSet<>();

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();
}
