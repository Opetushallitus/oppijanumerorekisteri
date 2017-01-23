package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.stream.Stream;

/**
 * @deprecated Koodisto "yhteystietojenalkupera"
 */
@Deprecated
public enum YhteystietoRyhmaAlkuperatieto {
    RYHMAALKUPERA_VTJ("alkupera1", "ryhmaalkuperaVtj"),
    RYHMAALKUPERA_VIRKAILIJA("alkupera2", "ryhmaalkuperaVirkailija"),
    RYHMAALKUPERA_OMAT_TIEDOT("alkupera3", "ryhmaalkuperaOmatTiedot"),
    RYHMAALKUPERA_HAKULOMAKE("alkupera4", "ryhmaalkuperaHakulomake"),
    RYHMAALKUPERA_TIEDONSIIRROT("alkupera5", "ryhmaalkuperaTiedonsiirrot"),
    RYHMAALKUPERA_OIKEUSTULKKIREKISTERI("alkupera7", "ryhmaalkuperaOikeustulkkirekisteri"),
    RYHMAALKUPERA_MUU("alkupera6", "ryhmaalkuperaMuu");

    private final String alkuperatieto;
    private final String alias;

    YhteystietoRyhmaAlkuperatieto(String alkuperatieto, String alias) {
        this.alkuperatieto = alkuperatieto;
        this.alias = alias;
    }

    public String getAlkuperatieto() {
        return alkuperatieto;
    }

    @JsonValue
    public String getAlias() {
        return alias;
    }

    @JsonCreator
    public static YhteystietoRyhmaAlkuperatieto forValue(String str) {
        if (str == null) {
            return null;
        }
        return Stream.of(values()).filter(v -> str.equalsIgnoreCase(v.name())
                    || str.equalsIgnoreCase(v.getAlias())
                    || str.equalsIgnoreCase(v.getAlkuperatieto()))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Can not find YhteystietoRyhmaKuvaus for " + str));
    }
}
