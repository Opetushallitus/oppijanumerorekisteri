package fi.vm.sade.oppijanumerorekisteri.utils;

import java.util.Optional;
import java.util.function.Supplier;

public final class OptionalUtils {

    private OptionalUtils() {
    }

    // tämän metodin voi poistaa java9+ (käytä Optional#or)
    public static <T> Optional<T> or(Optional<T> optional, Supplier<Optional<T>> fallback) {
        return optional.isPresent() ? optional : fallback.get();
    }

}
