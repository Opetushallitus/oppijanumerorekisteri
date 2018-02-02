package fi.vm.sade.oppijanumerorekisteri.validators;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

public final class KutsumanimiValidator {

    private final List<String> basicDataSeparatedByWhitespace;
    private final List<String> basicDataSeparatedByWhitespaceAndDashes;

    public KutsumanimiValidator(String etunimet) {
        String etunimetLowercase = etunimet.toLowerCase();
        // Basic set
        this.basicDataSeparatedByWhitespace = Arrays.stream(etunimetLowercase.split(" "))
                .map(String::trim)
                .collect(toList());
        // Basic set separated by dashes and spaces
        this.basicDataSeparatedByWhitespaceAndDashes = Arrays.stream(etunimetLowercase.split("[ \\-]"))
                .map(String::trim)
                .collect(toList());

    }

    public boolean isValid(String kutsumanimi) {
        // e.g. "arpa-tupla noppa kuutio" => "arpa-tupla" "noppa" "kuutio" "arpa-tupla noppa" "noppa kuutio" "arpa-tupla noppa kuutio"
        Set<String> subsequentTuples = this.basicDataSeparatedByWhitespace.stream()
                .flatMap(etunimi -> this.findSequentialTuples(this.basicDataSeparatedByWhitespace, etunimi))
                .collect(Collectors.toSet());

        // e.g. "arpa-tupla noppa kuutio" => "arpa" "tupla" "noppa" "kuutio" "arpa tupla noppa" "noppa kuutio" "arpa tupla noppa kuutio"
        Set<String> subsequentTuplesWithoutDash = this.basicDataSeparatedByWhitespaceAndDashes.stream()
                .flatMap(etunimi -> this.findSequentialTuples(this.basicDataSeparatedByWhitespaceAndDashes, etunimi))
                .collect(Collectors.toSet());

        // Compare all valid cases
        return Stream.of(subsequentTuples, subsequentTuplesWithoutDash)
                .flatMap(Collection::stream)
                .map(String::toLowerCase)
                .distinct()
                .anyMatch(etunimi -> etunimi.equals(kutsumanimi.toLowerCase()));
    }

    private Stream<String> findSequentialTuples(List<String> basicDataSet, String etunimi) {
        int currentIndex = basicDataSet.indexOf(etunimi);
        int finalIndex = basicDataSet.size();
        Set<String> set = new HashSet<>();
        // Go through sequential tuples with all valid tuple sizes
        for (int tupleSize = 1; tupleSize <= finalIndex; tupleSize++) {
            for (int i = currentIndex; i <= finalIndex - tupleSize; i++) {
                String flatSet = basicDataSet.subList(i, i + tupleSize).stream()
                        .reduce((currentEtunimi, nextEtunimi) -> currentEtunimi + " " + nextEtunimi)
                        .orElseThrow(RuntimeException::new);
                set.add(flatSet);
            }
        }
        return set.stream();
    }

}
