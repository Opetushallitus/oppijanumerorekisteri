package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.*;
import lombok.Setter;

import javax.validation.constraints.NotNull;
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

    private String oidhenkilo;

    @NotNull
    private String hetu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    private KielisyysDto aidinkieli;

    private KielisyysDto asiointikieli;

    private Set<KansalaisuusDto> kansalaisuus;

    @NotNull
    private HenkiloTyyppi henkilotyyppi;
}
