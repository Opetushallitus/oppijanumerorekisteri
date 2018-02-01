package fi.vm.sade.oppijanumerorekisteri.validators;

import static java.util.Objects.requireNonNull;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class KutsumanimiValidator {

    private final Set<Character> valimerkit = Stream.of(' ', '-').collect(toSet());
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
        Set<String> separatedByDash = separatedByWhitespace.stream()
                .filter(etunimi -> etunimi.contains("-"))
                .flatMap(etunimi -> Arrays.stream(etunimi.split("-")))
                .collect(toSet());
        // e.g. "arpa noppa kuutio" "arpa noppa" "noppa kuutio"
        Set<String> permutationsOfWhitespaceSeparation = separatedByWhitespace
                .subList(0, separatedByWhitespace.size()-1).stream()
                .map(etunimi -> etunimi + " " + separatedByWhitespace.get(separatedByWhitespace.indexOf(etunimi)+1))
                .collect(Collectors.toSet());
        // Compare all valid cases
        return Stream.of(separatedByWhitespace, separatedByDash, permutationsOfWhitespaceSeparation)
                .flatMap(Collection::stream)
                .map(String::toLowerCase)
                .anyMatch(etunimi -> etunimi.equals(kutsumanimiLowerCase));
    }

}
