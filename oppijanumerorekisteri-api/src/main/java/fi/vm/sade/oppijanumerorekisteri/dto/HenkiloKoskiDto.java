package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Set;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
