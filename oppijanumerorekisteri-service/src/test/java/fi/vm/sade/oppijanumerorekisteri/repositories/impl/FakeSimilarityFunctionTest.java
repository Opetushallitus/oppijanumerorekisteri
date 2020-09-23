package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import org.junit.Test;

import static fi.vm.sade.oppijanumerorekisteri.repositories.impl.FakeSimilarityFunction.similarity;
import static org.junit.Assert.assertEquals;

public class FakeSimilarityFunctionTest {

    @Test
    public void matchesCompletely() {
        String a = "Eino Ilmari Urho Kaleva Eino Testiäinen";
        float similarity = similarity(a, a);
        assertEquals(1.0f, similarity, 0.01f);
    }

    @Test
    public void matchesPartially() {
        String a = "Eino Ilmari Urho Kaleva Eino Testiäinen";
        String b = "Eino Eino Testiäinen";
        float similarity = similarity(a, b);
        assertEquals(0.5f, similarity, 0.01f);
    }

    @Test
    public void noMatch() {
        String a = "Eino Ilmari Urho Kaleva Eino Testiäinen";
        String b = "Teppo Severi Abraham Teppo Tulppu";
        float similarity = similarity(a, b);
        assertEquals(0.0f, similarity, 0.01f);
    }
}
