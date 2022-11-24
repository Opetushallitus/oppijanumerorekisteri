package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaTuontiPerustiedotReadDto {

    private long id;
    private int kasiteltavia;
    private int kasiteltyja;
    private boolean kasitelty;

}
