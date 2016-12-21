package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.*;
import lombok.Setter;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Date;
import java.util.Set;
import static org.springframework.util.StringUtils.isEmpty;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// If you do changes to lazy loaded stuff update henkiloWithPerustiedot entity graph from Henkilo.java
public class HenkiloPerustietoDto implements Serializable {
    private static final long serialVersionUID = -1263854768854256588L;

    private String oidHenkilo;

    private String externalId;

    @ValidateHetu
    private String hetu;

    @Size(min = 1)
    private String etunimet;

    @Size(min = 1)
    private String kutsumanimi;

    @Size(min = 1)
    private String sukunimi;

    private Date syntymaaika;

    private KielisyysDto aidinkieli;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private Set<KansalaisuusDto> kansalaisuus;

    private HenkiloTyyppi henkiloTyyppi;

    private String sukupuoli;

    // Helper value to recognise when henkilo is created on service layer.
    @JsonIgnore
    private boolean createdOnService;

    private boolean isFind() {
        return !isEmpty(getOidHenkilo()) || !isEmpty(getExternalId());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.hetu.empty")
    public boolean isHetuExistsIfCreate() {
        return isFind() || !isEmpty(getHetu());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.etunimet.empty")
    public boolean isEtunimetValidIfCreate() {
        return isFind() || !isEmpty(getEtunimet());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.kutsumanimi.empty")
    public boolean isKutsumanimiValidIfCreate() {
        return isFind() || !isEmpty(getKutsumanimi());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.sukunimi.empty")
    public boolean isSukunimiValidIfCreate() {
        return isFind() || !isEmpty(getSukunimi());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.henkilotyyppi.empty")
    public boolean isHenkilotyyppiValidIfCreate() {
        return isFind() || henkiloTyyppi != null;
    }
}
