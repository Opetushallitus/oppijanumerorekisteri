package fi.vm.sade.oppijanumerorekisteri.utils;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

public final class YhteystietoryhmaUtils {

    private YhteystietoryhmaUtils() {
    }

    public static final String TYYPPI_TYOOSOITE = "yhteystietotyyppi2";
    public static final String ALKUPERA = "alkupera6";

    public static void updateYhteystiedot(Collection<YhteystiedotRyhmaDto> dtoCollection, Collection<YhteystiedotRyhma> yhteystiedotRyhmas, boolean overwriteReadOnly) {
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
                        YhteystiedotRyhma yhteystiedotRyhma = new YhteystiedotRyhma();
                        yhteystiedotRyhma.setRyhmaKuvaus(yhteystiedotRyhmaDto.getRyhmaKuvaus());
                        yhteystiedotRyhma.setRyhmaAlkuperaTieto(yhteystiedotRyhmaDto.getRyhmaAlkuperaTieto());
                        yhteystiedotRyhma.setReadOnly(yhteystiedotRyhmaDto.isReadOnly());
                        yhteystiedotRyhma.setYhteystieto(
                                yhteystiedotRyhmaDto.getYhteystieto().stream()
                                        .map((y) -> {
                                            Yhteystieto yhteystieto = new Yhteystieto();
                                            yhteystieto.setId(null);
                                            yhteystieto.setYhteystietoArvo(y.getYhteystietoArvo());
                                            yhteystieto.setYhteystietoTyyppi(y.getYhteystietoTyyppi());
                                            return yhteystieto;
                                        })
                                        .collect(toSet()));
                        yhteystiedotRyhma.setId(null);
                        return yhteystiedotRyhma;
                    }), readOnlyRyhmat.stream()) // lisätään read-only ryhmät takaisin
                    .filter(YhteystiedotRyhma::isNotEmpty) // poistetaan tyhjät yhteystietoryhmät (myös read-only)
                    .collect(toSet()));
        }

    }

}
