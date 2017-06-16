package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@lombok.Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HenkiloViiteDto implements Serializable {
    private String slaveOid;
    private String masterOid;
}
