package fi.vm.sade.oppijanumerorekisteri.utils;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VtjYhteystiedotRyhma {
    VAKINAINEN_KOTIMAINEN_OSOITE("yhteystietotyyppi4"),
    VAKINAINEN_ULKOMAINEN_OSOITE("yhteystietotyyppi5"),
    SAHKOPOSTIOSOITE("yhteystietotyyppi8"),
    TILAPAINEN_KOTIMAINEN_OSOITE("yhteystietotyyppi9"),
    TILAPAINEN_ULKOMAINEN_OSOITE("yhteystietotyyppi10"),
    KOTIMAINEN_POSTIOSOITE("yhteystietotyyppi11"),
    ULKOMAINEN_POSTIOSOITE("yhteystietotyyppi12");

    private final String kuvaus;
}
