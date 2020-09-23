package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import java.util.Arrays;
import java.util.List;

public class FakeSimilarityFunction {

    public static float similarity(String a, String b) {
        assert(a != null && b != null);
        List<String> partsA = split(a);
        List<String> partsB = split(b);
        long matches = partsA.stream().filter(partsB::contains).count();
        long maxParts = Math.max(partsA.size(), partsB.size());
        return (float) matches / maxParts;
    }

    private static List<String> split(String s) {
        return Arrays.asList(s.split("\\s"));
    }

}
