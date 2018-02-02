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

        // Basic set
        List<String> separatedByWhitespace = Arrays.stream(this.etunimet.split(" "))
                .map(String::trim)
                .collect(toList());

        // e.g. "arpa-tupla noppa kuutio" => "arpa-tupla" "noppa" "kuutio" "arpa-tupla noppa" "noppa kuutio" "arpa-tupla noppa kuutio"
        Set<String> subsequentPairs = separatedByWhitespace.stream()
                .flatMap(etunimi -> this.findSequentialTuples(separatedByWhitespace, etunimi))
                .collect(Collectors.toSet());

        // Basic set separated by dashes and spaces
        List<String> withoutDashes = Arrays.stream(this.etunimet.split("[ \\-]"))
                .map(String::trim)
                .collect(toList());
        // e.g. "arpa-tupla noppa kuutio" "arpa tupla noppa" "noppa kuutio" "arpa tupla noppa kuutio"
        Set<String> subsequentWithoutDash = withoutDashes.stream()
                .flatMap(etunimi -> this.findSequentialTuples(withoutDashes, etunimi))
                .collect(Collectors.toSet());
        // Compare all valid cases
        return Stream.of(subsequentPairs, subsequentWithoutDash)
                .flatMap(Collection::stream)
                .map(String::toLowerCase)
                .distinct()
                .anyMatch(etunimi -> etunimi.equals(kutsumanimiLowerCase));
    }

    private Stream<? extends String> findSequentialTuples(List<String> separatedByWhitespace, String etunimi) {
        int currentIndex = separatedByWhitespace.indexOf(etunimi);
        int finalIndex = separatedByWhitespace.size();
        Set<String> set = new HashSet<>();
        // Go through sequential tuples with all valid tuple sizes
        for (int tupleSize = 1; tupleSize <= finalIndex; tupleSize++) {
            for (int i = currentIndex; i <= finalIndex-tupleSize; i++) {
                String flatSet = separatedByWhitespace.subList(i, i + tupleSize).stream()
                        .reduce((currentEtunimi, nextEtunimi) -> currentEtunimi + " " + nextEtunimi)
                        .orElseThrow(RuntimeException::new);
                set.add(flatSet);
            }
        }
        return set.stream();
    }

}
