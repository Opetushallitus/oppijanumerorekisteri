package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.util.Collection;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OppijaTuontiReadDto {

    private long id;
    private int kasiteltavia;
    private int kasiteltyja;
    private boolean kasitelty;

    private Collection<OppijaTuontiRiviReadDto> henkilot;

}
