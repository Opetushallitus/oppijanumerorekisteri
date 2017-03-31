package fi.vm.sade.oppijanumerorekisteri.dto;

import static java.util.Collections.emptyList;
import java.util.Iterator;
import java.util.List;
import static java.util.Objects.requireNonNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.RequiredArgsConstructor;

/**
 * Kevyempi malli sivutukselle. Sisältää varsinaisen {@link #results datan}
 * lisäksi vain onko sivu {@link #last viimeinen}, jonka avulla pystyy
 * läpikäymään tiedot läpi.
 *
 * @param <T> listan alkioiden tyyppi
 */
@Getter
@Setter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class Slice<T> implements Iterable<T> {

    private final int number;
    private final int size;
    private final int numberOfElements;
    private final boolean last;
    private final List<T> results;

    public static <T> Slice of(int number, int count, List<T> results) {
        requireNonNull(results);
        if (results.size() > count) {
            List<T> slice = results.subList(0, count);
            return new Slice(number, count, slice.size(), false, slice);
        } else {
            return new Slice(number, count, results.size(), true, results);
        }
    }

    public static <T> Slice empty(int number, int count) {
        return new Slice(number, count, 0, true, emptyList());
    }

    @Override
    public Iterator<T> iterator() {
        return results.iterator();
    }

}
