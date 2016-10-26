package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.*;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;
import java.io.Serializable;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HenkiloKoskiDto implements Serializable {
    private static final long serialVersionUID = -1263854768854256588L;

    private String oidhenkilo;

    @NotNull
    private String hetu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    @Null
    private KielisyysDto aidinkieli;

    @Null
    private Set<KansalaisuusDto> kansalaisuus;
}
