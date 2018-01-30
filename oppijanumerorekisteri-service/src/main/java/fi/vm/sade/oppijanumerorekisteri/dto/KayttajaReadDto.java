package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KayttajaReadDto {

    private String oid;
    private String kayttajaTyyppi;

    @Deprecated
    public boolean isOppija() {
        return kayttajaTyyppi == null || "OPPIJA".equals(kayttajaTyyppi);
    }

}
