package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplikaattiCriteria;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringRunner.class)
@IntegrationTest
@Sql("/sql/find-duplicate-test.sql")
public class HenkiloRepositoryImplIntegrationTest {

    private static final LocalDate HENKILO_SYNTYMAAIKA = LocalDate.of(1911, 11, 11);

    @Autowired
    private HenkiloRepository repository;

    @Test
    public void matchesByNames() {
        List<Henkilo> duplikaatit = repository.findDuplikaatit(new HenkiloDuplikaattiCriteria(
                "Eino Ilmari Urho Kaleva",
                "Urho",
                "Testiäinen",
                null
        ));
        assertEquals(1, duplikaatit.size());
    }

    @Test
    public void matchesBySimilarNamesAndBirthDate() {
        List<Henkilo> duplikaatit = repository.findDuplikaatit(new HenkiloDuplikaattiCriteria(
                "Eino",
                "Urho",
                "Testiäinen",
                HENKILO_SYNTYMAAIKA
        ));
        assertEquals(2, duplikaatit.size());
    }

    @Test
    public void noMatchWithDissimilarNames() {
        List<Henkilo> duplikaatit = repository.findDuplikaatit(new HenkiloDuplikaattiCriteria(
                "Einari",
                "Helmenkalastaja",
                "Testinperä",
                HENKILO_SYNTYMAAIKA
        ));
        assertTrue(duplikaatit.isEmpty());
    }
}
