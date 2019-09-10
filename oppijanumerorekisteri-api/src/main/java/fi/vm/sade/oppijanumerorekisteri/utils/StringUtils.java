package fi.vm.sade.oppijanumerorekisteri.utils;

public final class StringUtils {

    private StringUtils() {
    }

    public static boolean isEmpty(String str) {
        return str == null || "".equals(str);
    }

}
