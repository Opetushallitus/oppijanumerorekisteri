package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
