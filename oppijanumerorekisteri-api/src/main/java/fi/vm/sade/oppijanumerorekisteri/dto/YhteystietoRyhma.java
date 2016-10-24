package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.stream.Stream;

public enum YhteystietoRyhma {
    KOTIOSOITE("yhteystietotyyppi1", "kotiosoite"),
    TYOOSOITE("yhteystietotyyppi2", "tyoosoite"),
    VAPAA_AJAN_OSOITE("yhteystietotyyppi3", "vapaaAjanOsoite"),
    VAKINAINEN_KOTIMAAN_OSOITE("yhteystietotyyppi4", "vakinainenKotimaanOsoite"),
    VAKINAINEN_ULKOMAAN_OSOITE("yhteystietotyyppi5", "vakinainenUlkomaanOsoite"),
    HAKEMUS_OSOITE("yhteystietotyyppi6", "hakemusOsoite"),
    MUU_OSOITE("yhteystietotyyppi7", "muuOsoite"),
    VTJ_SAHKOINEN_OSOITE("yhteystietotyyppi8", "vtjSahkoinenOsoite");
    
    public static final YhteystietoRyhma[] PRIORITY_ORDER = {TYOOSOITE, KOTIOSOITE, MUU_OSOITE, VAPAA_AJAN_OSOITE};
    private final String ryhmanKuvaus;
    private final String alias;

    YhteystietoRyhma(String ryhmanKuvaus, String alias) {
        this.ryhmanKuvaus = ryhmanKuvaus;
        this.alias = alias;
    }

    public String getRyhmanKuvaus() {
        return ryhmanKuvaus;
    }

    @JsonValue
    public String getAlias() {
        return alias;
    }

    @JsonCreator
    public static YhteystietoRyhma forValue(String str) {
        if (str == null) {
            return null;
        }
        return Stream.of(values()).filter(v -> str.equalsIgnoreCase(v.name())
                    || str.equalsIgnoreCase(v.getAlias())
                    || str.equalsIgnoreCase(v.getRyhmanKuvaus()))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Can not find YhteystietoRyhma for " + str));
    }
}
