package fi.vm.sade.oppijanumerorekisteri.validation;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class HetuUtils {
    private static final char[] tarkistusmerkit = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'};
    private static final Map<String, Integer> erotinmerkit = Map.of(
                    1800, List.of("+"),
                    1900, List.of("-", "Y", "X", "W", "V", "U"),
                    2000, List.of("A", "B", "C", "D", "E", "F")
            ).entrySet()
            .stream()
            .flatMap(erotinByVuosisata -> erotinByVuosisata.getValue().stream().map(erotin -> Map.entry(erotin, erotinByVuosisata.getKey())))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("ddMMyyyy");

    public static boolean hetuIsValid(String hetu) {
        if (hetu != null && hetu.length() == 11) {
            try {
                dateFromHetu(hetu);
                int luku = Integer.parseInt(hetu.substring(0, 6) + hetu.substring(7, 10), 10);
                return hetu.charAt(10) == tarkistusmerkit[luku % 31];
            } catch (Exception e) {
                // do not throw exceptions
            }
        }
        return false;
    }

    public static LocalDate dateFromHetu(String hetu) {
        int vuosi = Optional.of(erotinmerkit.get(hetu.substring(6, 7))).get();
        vuosi += Integer.parseInt(hetu.substring(4, 6), 10);
        return LocalDate.parse(hetu.substring(0, 4) + vuosi, dateFormatter);
    }

    public static String sukupuoliFromHetu(String hetu) {
        return Character.digit(hetu.charAt(9), 10) % 2 == 0 ? "2" : "1";
    }
}
