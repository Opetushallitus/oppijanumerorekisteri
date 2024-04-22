package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class KoodiNimiReadDto {

    private static final String LANG_FI = "FI";
    private static final String LANG_SV = "SV";
    private static final String LANG_EN = "EN";

    private String koodi;

    private Nimi nimi;

    public KoodiNimiReadDto(String koodi, Map<String, String> nimet) {
        this.koodi = koodi;
        nimi = new Nimi(
                nimet.get(LANG_FI),
                nimet.get(LANG_SV),
                nimet.get(LANG_EN));
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class Nimi {
        @JsonProperty(LANG_FI)
        @Schema
        String fi;
        @JsonProperty(LANG_SV)
        @Schema
        String sv;
        @JsonProperty(LANG_EN)
        @Schema
        String en;
    }
}
