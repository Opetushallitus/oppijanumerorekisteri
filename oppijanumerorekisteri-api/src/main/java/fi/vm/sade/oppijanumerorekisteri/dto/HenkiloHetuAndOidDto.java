package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.*;

import java.io.Serializable;
import java.util.Date;

@Getter
@lombok.Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HenkiloHetuAndOidDto implements Serializable {
    private static final long serialVersionUID = 813852020644110186L;

    private String oidHenkilo;

    @ValidateHetu
    private String hetu;

    private Date vtjsynced;
}
