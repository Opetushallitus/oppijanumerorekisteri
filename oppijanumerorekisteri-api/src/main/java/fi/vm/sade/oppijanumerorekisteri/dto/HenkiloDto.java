package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ExistingHenkilo;
import fi.vm.sade.oppijanumerorekisteri.validation.NewHenkilo;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloDto implements Serializable {
    private static final long serialVersionUID = -8509596443256973893L;

    @Null(groups = NewHenkilo.class)
    @NotNull(groups = ExistingHenkilo.class)
    private String oidhenkilo;

    @NotNull
    @Size(min = 1)
    @ValidateHetu
    private String hetu;

    private boolean passivoitu;

    @NotNull
    private HenkiloTyyppi henkilotyyppi;

    @NotNull @Size(min = 1)
    private String etunimet;

    @NotNull @Size(min = 1)
    private String kutsumanimi;

    @NotNull @Size(min = 1)
    private String sukunimi;

    private KielisyysDto aidinkieli;

    @ValidateAsiointikieli
    private KielisyysDto asiointikieli;

    private Set<KielisyysDto> kielisyys = new HashSet<>();

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private String kasittelijaOid;

    private Date syntymaaika;

    private String sukupuoli;
}
