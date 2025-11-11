package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloOidHetuNimiDto implements Serializable {
    private static final long serialVersionUID = -1898692955251746384L;

    private String oidHenkilo;

    @ValidateHetu
    private String hetu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;
}
