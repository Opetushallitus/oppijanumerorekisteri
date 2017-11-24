package fi.vm.sade.oppijanumerorekisteri.dto;

import java.util.Collection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

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
