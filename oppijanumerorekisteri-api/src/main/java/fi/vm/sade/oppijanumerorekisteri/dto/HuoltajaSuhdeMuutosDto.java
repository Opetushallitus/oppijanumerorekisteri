package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class HuoltajaSuhdeMuutosDto implements Serializable {
    private  String oidLapsi;
}
