package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OppijaTuontiYhteenvetoDto {

    private long onnistuneet;
    private long virheet;
    private long keskeneraiset;

    public long getYhteensa() {
        return onnistuneet + virheet + keskeneraiset;
    }

}
