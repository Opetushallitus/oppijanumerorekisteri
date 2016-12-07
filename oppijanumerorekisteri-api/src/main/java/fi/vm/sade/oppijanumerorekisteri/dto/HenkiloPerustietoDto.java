package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fi.vm.sade.oppijanumerorekisteri.validation.FindOrNewHenkilo;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.*;
import lombok.Setter;
import org.springframework.util.StringUtils;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// If you do changes to lazy loaded stuff update henkiloWithPerustiedot entity graph from Henkilo.java
public class HenkiloPerustietoDto implements Serializable {
    private static final long serialVersionUID = -1263854768854256588L;

    private String oidHenkilo;

    @NotNull @Size(min = 1)
    @ValidateHetu
    private String hetu;

    @NotNull @Size(min = 1)
    private String etunimet;

    @NotNull @Size(min = 1)
    private String kutsumanimi;

    @NotNull @Size(min = 1)
    private String sukunimi;

    private KielisyysDto aidinkieli;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private Set<KansalaisuusDto> kansalaisuus;

    @NotNull
    private HenkiloTyyppi henkiloTyyppi;

    private String sukupuoli;

    @JsonIgnore
    @AssertTrue(groups = FindOrNewHenkilo.class, message = "invalid.etunimet")
    public boolean isEtunimetValidIfCreate() {
        return !StringUtils.isEmpty(this.getOidhenkilo()) ||
                (!StringUtils.isEmpty(this.getHetu()) && !StringUtils.isEmpty(this.getEtunimet()));
    }

    @JsonIgnore
    @AssertTrue(groups = FindOrNewHenkilo.class, message = "invalid.kutsumanimi")
    public boolean isKutsumanimiValidIfCreate() {
        return !StringUtils.isEmpty(this.getOidhenkilo()) ||
                (!StringUtils.isEmpty(this.getHetu()) && !StringUtils.isEmpty(this.getKutsumanimi()));
    }

    @JsonIgnore
    @AssertTrue(groups = FindOrNewHenkilo.class, message = "invalid.sukunimi")
    public boolean isSukunimiValidIfCreate() {
        return !StringUtils.isEmpty(this.getOidhenkilo()) ||
                (!StringUtils.isEmpty(this.getHetu()) && !StringUtils.isEmpty(this.getSukunimi()));
    }

    @JsonIgnore
    @AssertTrue(groups = FindOrNewHenkilo.class, message = "invalid.henkilotyyppi")
    public boolean isHenkilotyyppiValidIfCreate() {
        return !StringUtils.isEmpty(this.getOidhenkilo()) ||
                (!StringUtils.isEmpty(this.getHetu()) && !StringUtils.isEmpty(this.getHenkilotyyppi()));
    }
}
