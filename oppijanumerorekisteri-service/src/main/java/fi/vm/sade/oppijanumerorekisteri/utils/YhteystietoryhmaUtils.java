package fi.vm.sade.oppijanumerorekisteri.utils;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import java.util.HashSet;
import java.util.Set;

public final class YhteystietoryhmaUtils {

    private YhteystietoryhmaUtils() {
    }

    public static final String TYYPPI_TYOOSOITE = "yhteystietotyyppi2";

    public static void setTyosahkopostiosoite(Set<YhteystiedotRyhma> yhteystietoryhmat, String arvo, String alkupera) {
        setYhteystieto(yhteystietoryhmat, TYYPPI_TYOOSOITE, YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, arvo, alkupera);
    }

    public static void setYhteystieto(Set<YhteystiedotRyhma> yhteystietoryhmat, String ryhmaKuvaus, YhteystietoTyyppi yhteystietoTyyppi, String arvo, String alkupera) {
        YhteystiedotRyhma yhteystietoryhma = yhteystietoryhmat.stream()
                .filter(ytr -> ryhmaKuvaus.equals(ytr.getRyhmaKuvaus()))
                .filter(ytr -> !ytr.isReadOnly())
                .findFirst().orElseGet(() -> {
                    YhteystiedotRyhma ytr = new YhteystiedotRyhma();
                    ytr.setRyhmaKuvaus(ryhmaKuvaus);
                    ytr.setYhteystieto(new HashSet<>());
                    ytr.setRyhmaAlkuperaTieto(alkupera);
                    yhteystietoryhmat.add(ytr);
                    return ytr;
                });
        Yhteystieto yhteystieto = yhteystietoryhma.getYhteystieto().stream()
                .filter(yt -> yhteystietoTyyppi.equals(yt.getYhteystietoTyyppi()))
                .findFirst().orElseGet(() -> {
                    Yhteystieto yt = new Yhteystieto();
                    yt.setYhteystietoTyyppi(yhteystietoTyyppi);
                    yhteystietoryhma.getYhteystieto().add(yt);
                    return yt;
                });
        yhteystieto.setYhteystietoArvo(arvo);
    }

}
