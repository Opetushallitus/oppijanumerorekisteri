package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.Iterator;
import java.util.List;

import static java.util.Collections.emptyList;
import static java.util.Objects.requireNonNull;

/**
 * Kevyempi malli sivutukselle. Sisältää varsinaisen {@link #results datan}
 * lisäksi vain onko sivu {@link #last viimeinen}, jonka avulla pystyy
 * läpikäymään tiedot läpi.
 *
 * @param <T> listan alkioiden tyyppi
 * @see Page malli sivutukselle jossa on mukana sivumäärä
 */
@Getter
@Setter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class Slice<T> implements Iterable<T> {

    private final int number;
    private final int size;
    private final List<T> results;
    private final boolean last;

    /**
     * Luo uuden sivun.
     *
     * @param <T> listan alkioiden tyyppi
     * @param page sivunumero (alkaa 1:stä)
     * @param count sivun koko
     * @param results sivun rivit
     * @return viipale
     */
    public static <T> Slice<T> of(int page, int count, List<T> results) {
        requireNonNull(results);
        if (results.size() > count) {
            List<T> slice = results.subList(0, count);
            return new Slice<>(page, count, slice, false);
        } else {
            return new Slice<>(page, count, results, true);
        }
    }

    /**
     * Luo tyhjän sivun.
     *
     * @param <T> listan alkioiden tyyppi
     * @param page sivunumero (alkaa 1:stä)
     * @param count sivun koko
     * @return
     */
    public static <T> Slice<T> empty(int page, int count) {
        return of(page, count, emptyList());
    }

    /**
     * Palauttaa sivussa olevien rivien määrän.
     *
     * @return rivimäärä
     */
    public int getNumberOfElements() {
        return results.size();
    }

    /**
     * Palauttaa onko tämä ensimmäinen sivu.
     *
     * @return onko ensimmäinen sivu
     */
    public boolean isFirst() {
        return number == 1;
    }

    @Override
    public Iterator<T> iterator() {
        return results.iterator();
    }

}
