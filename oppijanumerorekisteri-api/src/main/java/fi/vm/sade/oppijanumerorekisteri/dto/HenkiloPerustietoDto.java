package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import lombok.Setter;
import lombok.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;

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

    private List<@NotNull @Valid IdentificationDto> identifications;

    private String hetu;

    private List<EidasTunnisteDto> eidasTunnisteet;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    private LocalDate syntymaaika;

    private boolean turvakielto;

    private KielisyysDto aidinkieli;

    private KielisyysDto asiointiKieli;

    private Set<KansalaisuusDto> kansalaisuus;

    private String sukupuoli;

    private Date modified;

    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "Europe/Helsinki", pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    public ZonedDateTime getModifiedAt() {
        return DtoUtils.toZonedDateTime(modified);
    }
}
