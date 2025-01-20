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
 * Malli sivutukselle.
 *
 * @param <T> listan alkioiden tyyppi
 * @see Slice kevyempi malli sivutukselle
 */
@Getter
@Setter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class Page<T> implements Iterable<T> {

    private final int number;
    private final int size;
    private final List<T> results;
    private final long totalElements;

    /**
     * Luo uuden sivun.
     *
     * @param <T> listan alkioiden tyyppi
     * @param page sivunumero (alkaa 1:stä)
     * @param count sivun koko
     * @param results sivun rivit
     * @param total rivien kokonaismäärä
     * @return sivu
     */
    public static <T> Page<T> of(int page, int count, List<T> results, long total) {
        return new Page<>(page, count, requireNonNull(results), total);
    }

    /**
     * Luo tyhjän sivun.
     *
     * @param <T> listan alkioiden tyyppi
     * @param page sivunumero (alkaa 1:stä)
     * @param count sivun koko
     * @return sivu
     */
    public static <T> Page<T> empty(int page, int count) {
        return of(page, count, emptyList(), 0);
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

    /**
     * Palauttaa onko tämä viimeinen sivu.
     *
     * @return onko viimeinen sivu
     */
    public boolean isLast() {
        return getTotalPages() == number;
    }

    /**
     * Palauttaa sivujen määrän.
     *
     * @return sivumäärä
     */
    public int getTotalPages() {
        return (int) Math.ceil((double) totalElements / (double) size);
    }

    @Override
    public Iterator<T> iterator() {
        return results.iterator();
    }

}
