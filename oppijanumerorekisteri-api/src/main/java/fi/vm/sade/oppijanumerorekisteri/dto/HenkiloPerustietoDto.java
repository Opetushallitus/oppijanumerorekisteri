package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.Setter;
import lombok.*;

import javax.validation.Valid;
import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.springframework.util.StringUtils.hasLength;

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

    private List<@NotBlank String> externalIds;

    private List<@NotNull @Valid IdentificationDto> identifications;

    @ValidateHetu
    private String hetu;

    @Size(min = 1)
    private String etunimet;

    @Size(min = 1)
    private String kutsumanimi;

    @Size(min = 1)
    private String sukunimi;

    private LocalDate syntymaaika;

    private boolean turvakielto;

    private KielisyysDto aidinkieli;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private Set<KansalaisuusDto> kansalaisuus;

    private String sukupuoli;

    private Date modified;

    private String palveluasiayhteys;

    private boolean isFind() {
        return hasLength(getOidHenkilo());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.etunimet.empty")
    public boolean isEtunimetValidIfCreate() {
        return isFind() || hasLength(getEtunimet());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.kutsumanimi.empty")
    public boolean isKutsumanimiValidIfCreate() {
        return isFind() || hasLength(getKutsumanimi());
    }

    @JsonIgnore
    @AssertTrue(message = "invalid.sukunimi.empty")
    public boolean isSukunimiValidIfCreate() {
        return isFind() || hasLength(getSukunimi());
    }

    @Deprecated
    public HenkiloTyyppi getHenkiloTyyppi() {
        return HenkiloTyyppi.OPPIJA;
    }
}
