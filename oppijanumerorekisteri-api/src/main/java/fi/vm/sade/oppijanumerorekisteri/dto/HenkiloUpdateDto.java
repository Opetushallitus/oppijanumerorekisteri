package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
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

    @Size(min = 1)
    @ValidateHetu
    private String hetu;

    @NotNull
    private HenkiloTyyppi henkiloTyyppi;

    private LocalDate syntymaaika;

    private String sukupuoli;

    private boolean eiSuomalaistaHetua;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private KielisyysDto aidinkieli;

    private Set<KielisyysDto> kielisyys = new HashSet<>();

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();
}
