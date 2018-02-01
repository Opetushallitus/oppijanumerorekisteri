package fi.vm.sade.oppijanumerorekisteri.validators;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

public final class KutsumanimiValidator {

    private final String etunimet;

    public KutsumanimiValidator(String etunimet) {
        this.etunimet = etunimet.toLowerCase();
    }

    public boolean isValid(String kutsumanimi) {
        String kutsumanimiLowerCase = kutsumanimi.toLowerCase();

        // e.g. "arpa-noppa kuutio" => "arpa-noppa" "kuutio"
        List<String> separatedByWhitespace = Arrays.stream(this.etunimet.split(" "))
                .map(String::trim)
                .collect(toList());
        // e.g. "arpa-kuutio" => "arpa" "kuutio"
        List<String> separatedByDash = separatedByWhitespace.stream()
                .filter(etunimi -> etunimi.contains("-"))
                .flatMap(etunimi -> Arrays.stream(etunimi.split("-")))
                .collect(toList());
        // e.g. "arpa-tupla noppa kuutio" "arpa-tupla noppa" "noppa kuutio" "arpa-tupla noppa kuutio"
        Set<String> subsequentPairs = separatedByWhitespace.stream()
                .flatMap(etunimi -> this.getStream(separatedByWhitespace, etunimi))
                .collect(Collectors.toSet());
        // e.g. "arpa-tupla noppa kuutio" "arpa tupla noppa" "noppa kuutio" "arpa tupla noppa kuutio"
        List<String> withoutDashes = separatedByWhitespace.stream()
                .flatMap(etunimi -> etunimi.contains("-") ? Arrays.stream(etunimi.split("-")) : Stream.of(etunimi))
                .collect(toList());
        Set<String> subsequentWithoutDash = withoutDashes.stream()
                .flatMap(etunimi -> this.getStream(withoutDashes, etunimi))
                .collect(Collectors.toSet());
        // Compare all valid cases
        return Stream.of(separatedByWhitespace, separatedByDash, subsequentPairs, subsequentWithoutDash)
                .flatMap(Collection::stream)
                .map(String::toLowerCase)
                .distinct()
                .anyMatch(etunimi -> etunimi.equals(kutsumanimiLowerCase));
    }

    private Stream<? extends String> getStream(List<String> separatedByWhitespace, String etunimi) {
        int currentIndex = separatedByWhitespace.indexOf(etunimi);
        int lastIndex = separatedByWhitespace.size();
        Set<String> set = new HashSet<>();
        //
        for (int tupleSize = 2; tupleSize <= lastIndex; tupleSize++) {
            for (int i = currentIndex; i <= lastIndex-tupleSize; i++) {
                String flatSet = separatedByWhitespace.subList(i, i + tupleSize).stream()
                        .reduce((x, y) -> x + " " + y)
                        .orElseThrow(RuntimeException::new);
                set.add(flatSet);
            }
        }
        return set.stream();
    }

}
