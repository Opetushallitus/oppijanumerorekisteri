package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import jakarta.persistence.EntityManager;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
public class HuoltajasuhdeRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private EntityManager testEntityManager;

    @Autowired
    private HuoltajasuhdeRepository huoltajasuhdeRepository;

    @Test
    public void findCurrentHuoltajatByHenkiloReturnsEmptyWhenNoMatchingHenkilo() {
        List<HenkiloHuoltajaSuhde> results = huoltajasuhdeRepository.findCurrentHuoltajatByHenkilo("1.2.3.4");
        assertThat(results).isEmpty();
    }

    @Test
    public void findCurrentHuoltajatByHenkiloReturnsEmptyWhenNoHuoltajasuhde() {
        Henkilo henkilo = testiHenkilo();
        testEntityManager.persist(henkilo);
        List<HenkiloHuoltajaSuhde> results = huoltajasuhdeRepository.findCurrentHuoltajatByHenkilo(henkilo.getOidHenkilo());
        assertThat(results).isEmpty();
    }

    @Test
    public void findCurrentHuoltajatByHenkiloReturnsValidHuoltajasuhde() {
        Henkilo parent = testiHenkilo();
        Henkilo child = testiHenkilo("1.2.3.5");
        testEntityManager.persist(parent);
        testEntityManager.persist(child);
        HenkiloHuoltajaSuhde huoltajaSuhde = HenkiloHuoltajaSuhde.builder()
                .huoltaja(parent)
                .lapsi(child)
                .alkuPvm(LocalDate.now())
                .loppuPvm(LocalDate.now().plus(1, ChronoUnit.YEARS))
                .build();
        testEntityManager.persist(huoltajaSuhde);
        List<HenkiloHuoltajaSuhde> results = huoltajasuhdeRepository.findCurrentHuoltajatByHenkilo(child.getOidHenkilo());
        assertThat(results).isNotEmpty();
    }

    @Test
    public void findCurrentHuoltajatByHenkiloReturnsHuoltajasuhdeWithoutValidDates() {
        Henkilo parent = testiHenkilo();
        Henkilo child = testiHenkilo("1.2.3.5");
        testEntityManager.persist(parent);
        testEntityManager.persist(child);
        HenkiloHuoltajaSuhde huoltajaSuhde = HenkiloHuoltajaSuhde.builder()
                .huoltaja(parent)
                .lapsi(child)
                .build();
        testEntityManager.persist(huoltajaSuhde);
        List<HenkiloHuoltajaSuhde> results = huoltajasuhdeRepository.findCurrentHuoltajatByHenkilo(child.getOidHenkilo());
        assertThat(results).isNotEmpty();
    }

    @Test
    public void findCurrentHuoltajatByHenkiloDoesNotReturnEndedHuoltajasuhde() {
        Henkilo parent = testiHenkilo();
        Henkilo child = testiHenkilo("1.2.3.5");
        testEntityManager.persist(parent);
        testEntityManager.persist(child);
        HenkiloHuoltajaSuhde huoltajaSuhde = HenkiloHuoltajaSuhde.builder()
                .huoltaja(parent)
                .lapsi(child)
                .alkuPvm(LocalDate.now().minus(19, ChronoUnit.YEARS))
                .loppuPvm(LocalDate.now())
                .build();
        testEntityManager.persist(huoltajaSuhde);
        List<HenkiloHuoltajaSuhde> results = huoltajasuhdeRepository.findCurrentHuoltajatByHenkilo(child.getOidHenkilo());
        assertThat(results).isEmpty();
    }

    private Henkilo testiHenkilo() {
        return testiHenkilo("1.2.3.4");
    }

    private Henkilo testiHenkilo(String oid) {
        Date now = new Date();
        return Henkilo.builder()
                .oidHenkilo(oid)
                .etunimet("Testi")
                .kutsumanimi("Testi")
                .sukunimi("Henkilö")
                .created(now)
                .modified(now)
                .build();
    }
}
