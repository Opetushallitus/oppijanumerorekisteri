package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloUpdateDto {
    private String oidhenkilo;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    @NotNull
    @Size(min = 1)
    private String hetu;

    @NotNull
    private HenkiloTyyppi henkilotyyppi;

    private Date syntymaaika;

    private String sukupuoli;

    private boolean eiSuomalaistaHetua;

    private Date muokkausPvm;

    private String kasittelijaOid;

    @ValidateAsiointikieli
    private KielisyysDto asiointikieli;

    private KielisyysDto aidinkieli;

    private Set<KielisyysDto> kielisyys = new HashSet<>();

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhmas = new HashSet<>();
}
