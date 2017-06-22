package fi.vm.sade.oppijanumerorekisteri.validators;

import static java.util.Objects.requireNonNull;

import java.util.Arrays;
import java.util.Set;
import static java.util.stream.Collectors.toSet;
import java.util.stream.Stream;

public final class KutsumanimiValidator {

    private final Set<Character> valimerkit = Stream.of(' ', '-').collect(toSet());
    private final String etunimet;

    public KutsumanimiValidator(String etunimet) {
        this.etunimet = etunimet.toLowerCase();
    }

    public boolean isValid(String kutsumanimi) {

        kutsumanimi = kutsumanimi.toLowerCase();
        if(Arrays.asList(etunimet.split(" ")).contains(kutsumanimi) == true) {
            return true;
        }

        int beginIndex = etunimet.indexOf(kutsumanimi);
        if (beginIndex == -1) {
            return false;
        }
        // tarkistetaan että molemmin puolin nimeä löytyy jokin sallittu välimerkki
        if (beginIndex > 0) {
            if (!valimerkit.contains(etunimet.charAt(beginIndex - 1))) {
                return false;
            }
        }
        int endIndex = beginIndex + kutsumanimi.length();
        if (endIndex < etunimet.length()) {
            if (!valimerkit.contains(etunimet.charAt(endIndex))) {
                return false;
            }
        }
        return true;
    }

}
