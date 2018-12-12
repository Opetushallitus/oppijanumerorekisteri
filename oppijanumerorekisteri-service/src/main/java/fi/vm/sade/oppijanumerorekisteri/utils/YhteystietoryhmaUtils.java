package fi.vm.sade.oppijanumerorekisteri.utils;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

public final class YhteystietoryhmaUtils {

    private YhteystietoryhmaUtils() {
    }

    public static final String TYYPPI_TYOOSOITE = "yhteystietotyyppi2";
    public static final String ALKUPERA = "alkupera6";

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

    public static void updateYhteystiedot(Collection<YhteystiedotRyhmaDto> dtoCollection, Collection<YhteystiedotRyhma> yhteystiedotRyhmas, boolean overwriteReadOnly, OrikaConfiguration mapper) {
        if (dtoCollection != null) {
            final Collection<YhteystiedotRyhma> readOnlyRyhmat;
            if (!overwriteReadOnly) {
                // poistetaan käyttäjän antamista ryhmistä read-only merkityt
                readOnlyRyhmat = yhteystiedotRyhmas.stream()
                        .filter(YhteystiedotRyhma::isReadOnly).collect(toList());
                dtoCollection.removeIf(dto
                        -> readOnlyRyhmat.stream().anyMatch(entity -> entity.isEquivalentTo(dto)));
            } else {
                readOnlyRyhmat = Collections.emptyList();
            }
            // rakennetaan ryhmälista uudelleen
            yhteystiedotRyhmas.clear();
            yhteystiedotRyhmas.addAll(Stream.concat(
                    // käyttäjän muokkaukset
                    dtoCollection.stream().map(yhteystiedotRyhmaDto -> {
                        YhteystiedotRyhma yhteystiedotRyhma = mapper.map(yhteystiedotRyhmaDto, YhteystiedotRyhma.class);
                        yhteystiedotRyhma.setId(null);
                        return yhteystiedotRyhma;
                    }), readOnlyRyhmat.stream()) // lisätään read-only ryhmät takaisin
                    .filter(YhteystiedotRyhma::isNotEmpty) // poistetaan tyhjät yhteystietoryhmät (myös read-only)
                    .collect(toSet()));
        }

    }

}
