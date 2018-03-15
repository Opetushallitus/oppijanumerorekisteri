package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.*;
import lombok.Setter;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Set;
import javax.validation.Valid;
import static org.springframework.util.StringUtils.isEmpty;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// If you do changes to lazy loaded stuff update henkiloWithPerustiedot entity graph from Henkilo.java
public class HenkiloPerustietoDto implements Serializable {
    private static final long serialVersionUID = -1263854768854256588L;

    @Size(min = 1)
    private String oidHenkilo;

    @Size(min = 1)
    private List<String> externalIds;

    @Valid
    @Size(min = 1)
    private List<IdentificationDto> identifications;

    @ValidateHetu
    private String hetu;

    @Size(min = 1)
    private String etunimet;

    @Size(min = 1)
    private String kutsumanimi;

    @Size(min = 1)
    private String sukunimi;

    private LocalDate syntymaaika;

    private KielisyysDto aidinkieli;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private Set<KansalaisuusDto> kansalaisuus;

    private String sukupuoli;

    private Date modified;

    private String palveluasiayhteys;

    private boolean isFind() {
        return !isEmpty(getOidHenkilo());
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

    @Deprecated
    public HenkiloTyyppi getHenkiloTyyppi() {
        return HenkiloTyyppi.OPPIJA;
    }
}
