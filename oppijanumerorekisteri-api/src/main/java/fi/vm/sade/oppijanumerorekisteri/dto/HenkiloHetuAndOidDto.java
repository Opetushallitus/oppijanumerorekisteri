package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.*;

import java.io.Serializable;
import java.util.Date;

@Getter
@lombok.Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HenkiloHetuAndOidDto implements Serializable {
    private String oidhenkilo;
    private String hetu;
    private Date vtjsynced;
}
