package fi.vm.sade.oppijanumerorekisteri.repositories;

import com.querydsl.core.NonUniqueResultException;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import jakarta.persistence.EntityManager;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.google.common.collect.Sets;

import jakarta.persistence.PersistenceException;
import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.util.*;

import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.HenkiloPopulator.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.TuontiPopulator.tuonti;
import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@Sql({"/turvakielto/truncate_data.sql"})
public class HenkiloRepositoryTests extends AbstractRepositoryTest {

    private static final String TESTI_HETU = "111111-1119";
    private static final String TOINEN_HETU = "121212-1219";

    @Autowired
    private HenkiloRepository dataRepository;

    @Autowired
    private EntityManager testEntityManager;

    @Test
    public void findBy() {
        HenkiloCriteria criteria = new HenkiloCriteria();

        List<HenkiloHakuDto> henkilot = this.dataRepository.findBy(criteria, 5L, 0L);

        assertThat(henkilot).isEmpty();
    }

    @Test
    public void findWithYhteystiedotBy() {
        HenkiloCriteria criteria = new HenkiloCriteria();

        List<HenkiloYhteystietoDto> henkilot = this.dataRepository.findWithYhteystiedotBy(criteria);

        assertThat(henkilot).isEmpty();
    }

    @Test
    public void findHetuByOid() {
        Henkilo henkilo = createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        this.persistHenkilo(henkilo);
        Optional<String> hetu = this.dataRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu).hasValue("123456-9999");
    }

    @Test
    public void findHetuByOidNoHetu() {
        Henkilo henkilo = createHenkilo("arpa", "arpa", "kuutio", "", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        this.persistHenkilo(henkilo);
        Optional<String> hetu = this.dataRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu).hasValue("");
    }

    @Test
    public void findOidByHetu() {
        Henkilo henkilo = createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        this.persistHenkilo(henkilo);
        Optional<String> oid = this.dataRepository.findOidByHetu("123456-9999");
        assertThat(oid).hasValue("1.2.3.4.5");
    }

    @Test
    public void userOidNotInDb() {
        Optional<String> hetu = this.dataRepository.findHetuByOid("unknown oid");
        assertThat(hetu).isEmpty();
    }

    @Test(expected = PersistenceException.class)
    public void createUserWithNullOid() {
        Henkilo henkiloWithNullOid = createHenkilo("arpa", "arpa", "kuutio", "123456-9999", null, false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        this.persistHenkilo(henkiloWithNullOid);
    }

    @Test
    public void findByOidhenkiloIsIn() {
        Date luontiMuokkausPvm = new Date();
        Henkilo assertHenkilo = createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        Henkilo persistedHenkilo = createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        this.persistHenkilo(persistedHenkilo);
        List<Henkilo> resultHenkiloList = this.dataRepository.findByOidHenkiloIsIn(Collections.singletonList("1.2.3.4.5"));
        persistedHenkilo = resultHenkiloList.get(0);
        assertThat(persistedHenkilo).usingRecursiveComparison()
                .ignoringFields("id", "version", "yhteystiedotRyhma", "vtjsynced", "aidinkieli.id", "aidinkieli.version", "asiointiKieli.id", "asiointiKieli.version", "kansalaisuus")
                .isEqualTo(assertHenkilo);
        assertThat(persistedHenkilo.getYhteystiedotRyhma().size()).isEqualTo(assertHenkilo.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(persistedHenkilo.getYhteystiedotRyhma().iterator().next()).usingRecursiveComparison()
                .ignoringFields("id", "version", "henkilo", "yhteystieto")
                .isEqualTo(assertHenkilo.getYhteystiedotRyhma().iterator().next());
        Set<Yhteystieto> persistedYhteystieto = persistedHenkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        Set<Yhteystieto> yhteystieto = assertHenkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        assertThat(persistedYhteystieto.size()).isEqualTo(yhteystieto.size()).isEqualTo(1);
        assertThat(persistedYhteystieto.iterator().next()).usingRecursiveComparison()
                .ignoringFields("id", "version", "yhteystiedotRyhma")
                .isEqualTo(yhteystieto.iterator().next());
    }

    @Test
    public void findByHetu() {
        Date luontiMuokkausPvm = new Date();
        Henkilo henkilo = createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        Henkilo persistedHenkilo = createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", LocalDate.of(1970, Month.OCTOBER, 10));
        this.persistHenkilo(persistedHenkilo);
        persistedHenkilo = this.dataRepository.findByHetu("123456-9999").orElse(null);
        assertThat(persistedHenkilo).usingRecursiveComparison()
                .ignoringFields("id", "version", "yhteystiedotRyhma", "vtjsynced", "aidinkieli.id", "aidinkieli.version", "asiointiKieli.id", "asiointiKieli.version", "kansalaisuus")
                .isEqualTo(henkilo);
        assertThat(persistedHenkilo.getYhteystiedotRyhma().size()).isEqualTo(henkilo.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(persistedHenkilo.getYhteystiedotRyhma().iterator().next()).usingRecursiveComparison()
                .ignoringFields("id", "version", "henkilo", "yhteystieto")
                .isEqualTo(henkilo.getYhteystiedotRyhma().iterator().next());
        Set<Yhteystieto> persistedYhteystieto = persistedHenkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        Set<Yhteystieto> yhteystieto = henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        assertThat(persistedYhteystieto.size()).isEqualTo(yhteystieto.size()).isEqualTo(1);
        assertThat(persistedYhteystieto.iterator().next()).usingRecursiveComparison()
                .ignoringFields("id", "version", "yhteystiedotRyhma")
                .isEqualTo(yhteystieto.iterator().next());
    }

    @Test
    public void findOidsModifiedSince() {
        DateTime now = new DateTime(),
                yesterday = now.minusDays(1),
                lastWeek = now.minusWeeks(1);
        populate(henkilo("YESTERDAY").modified(yesterday));
        populate(henkilo("LAST_WEEK").modified(lastWeek));
        populate(henkilo("MOMENT_AGO").modified(now.minusMinutes(1)));

        List<String> results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now, null, null);
        assertThat(results).hasSize(0);

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), null, null);
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo("MOMENT_AGO");

        results = this.dataRepository.findOidsModifiedSince(HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(asList("YESTERDAY", "LAST_WEEK"))).build(), yesterday, null, null);
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo("YESTERDAY");

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), lastWeek, null, null);
        assertThat(results).hasSize(3);
    }

    @Test
    public void findOidsModifiedSinceWithOffsetAndAmount() {
        DateTime now = new DateTime(),
                yesterday = now.minusDays(1),
                lastWeek = now.minusWeeks(1);
        populate(henkilo("YESTERDAY").modified(yesterday));
        populate(henkilo("LAST_WEEK").modified(lastWeek));
        populate(henkilo("1_MINUTE_AGO").modified(now.minusMinutes(1)));
        populate(henkilo("2_MINUTES_AGO").modified(now.minusMinutes(2)));
        populate(henkilo("3_MINUTES_AGO").modified(now.minusMinutes(3)));
        populate(henkilo("4_MINUTES_AGO").modified(now.minusMinutes(4)));

        List<String> results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), null, null);
        assertThat(results).hasSize(4);
        assertThat(results).containsAll(Set.of("1_MINUTE_AGO", "2_MINUTES_AGO", "3_MINUTES_AGO", "4_MINUTES_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 2, null);
        assertThat(results).hasSize(2);
        assertThat(results).containsAll(Set.of("2_MINUTES_AGO", "1_MINUTE_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), null, 2);
        assertThat(results).hasSize(2);
        assertThat(results).containsAll(Set.of("4_MINUTES_AGO", "3_MINUTES_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 1, 1);
        assertThat(results).hasSize(1);
        assertThat(results).containsAll(Set.of("3_MINUTES_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 100, 100);
        assertThat(results).hasSize(0);

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 1, 100);
        assertThat(results).hasSize(3);
        assertThat(results).containsAll(Set.of("3_MINUTES_AGO", "2_MINUTES_AGO", "1_MINUTE_AGO"));

    }

    @Test
    public void findByOppijaTuontiCriteriaTest() {
        Tuonti tuonti = populate(tuonti(
                henkilo("hetuton"),
                henkilo("hetuton_yksiloity").yksiloity(),
                henkilo("hetullinen").hetu("251098-9515"),
                henkilo("hetullinen_yksilointi_yritetty").hetu("251098-991E").yksilointiYritetty(),
                henkilo("hetullinen_yksiloity").hetu("251098-937P").yksiloityVtj(),
                henkilo("passivoitu").passivoitu(),
                henkilo("duplikaatti").duplikaatti()
        ));

        OppijaTuontiCriteria criteria = new OppijaTuontiCriteria();
        criteria.setTuontiId(null);
        criteria.setVainVirheet(false);
        assertThat(dataRepository.findBy(criteria, Integer.MAX_VALUE, 0, null))
                .extracting(Henkilo::getOidHenkilo, Henkilo::getYksilointiTila)
                .containsExactlyInAnyOrder(
                        tuple("hetuton", YksilointiTila.HETU_PUUTTUU),
                        tuple("hetuton_yksiloity", YksilointiTila.OK),
                        tuple("hetullinen", YksilointiTila.KESKEN),
                        tuple("hetullinen_yksilointi_yritetty", YksilointiTila.VIRHE),
                        tuple("hetullinen_yksiloity", YksilointiTila.OK),
                        tuple("passivoitu", YksilointiTila.OK),
                        tuple("duplikaatti", YksilointiTila.OK));

        criteria.setTuontiId(null);
        criteria.setVainVirheet(true);
        assertThat(dataRepository.findBy(criteria, Integer.MAX_VALUE, 0, null))
                .extracting(Henkilo::getOidHenkilo)
                .containsExactlyInAnyOrder("hetuton", "hetullinen_yksilointi_yritetty");

        criteria.setTuontiId(null);
        criteria.setVainVirheet(false);
        assertThat(dataRepository.countByYksilointiOnnistuneet(criteria)).isEqualTo(4);
        assertThat(dataRepository.countByYksilointiKeskeneraiset(criteria)).isEqualTo(1);
        assertThat(dataRepository.countByYksilointiVirheet(criteria)).isEqualTo(2);
        assertThat(dataRepository.countBy(criteria)).isEqualTo(7);

        criteria.setTuontiId(null);
        criteria.setVainVirheet(true);
        assertThat(dataRepository.countByYksilointiOnnistuneet(criteria)).isEqualTo(0);
        assertThat(dataRepository.countByYksilointiKeskeneraiset(criteria)).isEqualTo(0);
        assertThat(dataRepository.countByYksilointiVirheet(criteria)).isEqualTo(2);
        assertThat(dataRepository.countBy(criteria)).isEqualTo(2);

        criteria.setTuontiId(tuonti.getId());
        criteria.setVainVirheet(false);
        assertThat(dataRepository.countByYksilointiOnnistuneet(criteria)).isEqualTo(4);
        assertThat(dataRepository.countByYksilointiKeskeneraiset(criteria)).isEqualTo(1);
        assertThat(dataRepository.countByYksilointiVirheet(criteria)).isEqualTo(2);
        assertThat(dataRepository.countBy(criteria)).isEqualTo(7);

        criteria.setTuontiId(tuonti.getId());
        criteria.setVainVirheet(true);
        assertThat(dataRepository.countByYksilointiOnnistuneet(criteria)).isEqualTo(0);
        assertThat(dataRepository.countByYksilointiKeskeneraiset(criteria)).isEqualTo(0);
        assertThat(dataRepository.countByYksilointiVirheet(criteria)).isEqualTo(2);
        assertThat(dataRepository.countBy(criteria)).isEqualTo(2);
    }

    @Test
    public void findByOppijaTuontiCriteriaSanitationTest() {
        populate(tuonti(
                henkilo("hetuton"),
                henkilo("hetuton_yksiloity").yksiloity(),
                henkilo("hetullinen").hetu("251098-9515"),
                henkilo("hetullinen_yksilointi_yritetty").hetu("251098-991E").yksilointiYritetty(),
                henkilo("hetullinen_yksiloity").hetu("251098-937P").yksiloityVtj(),
                henkilo("passivoitu").passivoitu(),
                henkilo("duplikaatti").duplikaatti()
        ).aikaleima((new DateTime()).minusMonths(3).toDate())); // older than two months - subject to sanitation

        OppijaTuontiCriteria criteria = new OppijaTuontiCriteria();
        assertThat(dataRepository.findBy(criteria, Integer.MAX_VALUE, 0, null))
                .extracting(Henkilo::getOidHenkilo, Henkilo::getYksilointiTila)
                .containsExactlyInAnyOrder(
                        tuple("hetuton", YksilointiTila.HETU_PUUTTUU),
                        tuple("hetuton_yksiloity", YksilointiTila.OK),
                        tuple("hetullinen", YksilointiTila.KESKEN),
                        tuple("hetullinen_yksilointi_yritetty", YksilointiTila.VIRHE),
                        tuple("hetullinen_yksiloity", YksilointiTila.OK),
                        tuple("passivoitu", YksilointiTila.OK),
                        tuple("duplikaatti", YksilointiTila.OK));

        criteria.setVainVirheet(true);
        assertThat(dataRepository.findBy(criteria, Integer.MAX_VALUE, 0, null))
                .extracting(Henkilo::getOidHenkilo, Henkilo::getYksilointiTila)
                .containsExactlyInAnyOrder(
                        tuple("hetuton", YksilointiTila.HETU_PUUTTUU),
                        tuple("hetullinen_yksilointi_yritetty", YksilointiTila.VIRHE));
    }

    private void persistHenkilo(Henkilo henkilo) {
        if (henkilo.getAidinkieli() != null) {
                this.testEntityManager.persist(henkilo.getAidinkieli());
                this.testEntityManager.flush();
        }
        if (!CollectionUtils.isEmpty(henkilo.getKansalaisuus())) {
            henkilo.getKansalaisuus().forEach(kansalaisuus -> {
                this.testEntityManager.persist(kansalaisuus);
                this.testEntityManager.flush();
            });
        }
        this.testEntityManager.persist(henkilo);
        this.testEntityManager.flush();
    }

    @Test
    public void findByKaikkiHetutReturnsEmpty() {
        String hetu = "111111-1239";
        Henkilo testiHenkilo = createTestHenkilo(hetu);
        dataRepository.saveAndFlush(testiHenkilo);
        Henkilo toinenHenkilo = createTestHenkilo(TOINEN_HETU);
        dataRepository.saveAndFlush(toinenHenkilo);

        Optional<Henkilo> optHenkilo = dataRepository.findByKaikkiHetut(TESTI_HETU);
        assertFalse(optHenkilo.isPresent());
    }

    @Test
    public void findByMunicipalityAndDobEmpty() {
        List<HenkiloMunicipalDobDto> henkilos = dataRepository.findByMunicipalAndBirthdate("foo", LocalDate.of(2021, 11, 5), Long.MAX_VALUE, 0L);
        assertTrue(henkilos.isEmpty());
    }

    @Test
    public void findByMunicipalityAndDob() {

        String kunta = "foo";
        LocalDate dob = LocalDate.of(2021, 11, 5);
        Date dobDate = Date.from(dob.atStartOfDay(ZoneId.systemDefault()).toInstant());

        Henkilo testiHenkilo = Henkilo.builder()
                .oidHenkilo(UUID.randomUUID().toString())
                .etunimet("")
                .kutsumanimi("")
                .sukunimi("")
                .hetu("")
                .kotikunta(kunta)
                .syntymaaika(dob)
                .created(dobDate)
                .modified(dobDate)
                .build();

        dataRepository.saveAndFlush(testiHenkilo);

        List<HenkiloMunicipalDobDto> henkilos = dataRepository.findByMunicipalAndBirthdate(kunta, dob, Long.MAX_VALUE, 0L);
        assertEquals("Incorrect result size", 1, henkilos.size());

        henkilos = dataRepository.findByMunicipalAndBirthdate("bar", dob, Long.MAX_VALUE, 0L);
        assertTrue("Result should be empty (municipality)", henkilos.isEmpty());

        henkilos = dataRepository.findByMunicipalAndBirthdate(kunta, dob.plusDays(1), Long.MAX_VALUE, 0L);
        assertTrue("Result should be empty (dob)", henkilos.isEmpty());

        henkilos = dataRepository.findByMunicipalAndBirthdate(kunta, dob, Long.MAX_VALUE, 1L);
        assertTrue("Result should be empty (offset)", henkilos.isEmpty());
    }

    @Test
    public void findDeadWithIncompleteCleanup() {
        LocalDate dod = LocalDate.of(2015, 12, 28);
        Date dodDate = Date.from(dod.atStartOfDay(ZoneId.systemDefault()).toInstant());

        Henkilo testiHenkilo = Henkilo.builder()
                .oidHenkilo(UUID.randomUUID().toString())
                .etunimet("Ian Fraser")
                .kutsumanimi("Lemmy")
                .sukunimi("Kilmister")
                .hetu("")
                .kuolinpaiva(dod)
                .created(dodDate)
                .modified(dodDate)
                .build();

        dataRepository.saveAndFlush(testiHenkilo);

        Collection<Henkilo> henkilos = dataRepository.findDeadWithIncompleteCleanup(CleanupStep.INITIATED);
        assertEquals("Incorrect result size", 1, henkilos.size());
    }

    @Test
    public void findDeadWithIncompleteCleanupAllDone() {
        LocalDate dod = LocalDate.of(2015, 12, 28);
        Date dodDate = Date.from(dod.atStartOfDay(ZoneId.systemDefault()).toInstant());

        Henkilo testiHenkilo = Henkilo.builder()
                .oidHenkilo(UUID.randomUUID().toString())
                .etunimet("Ian Fraser")
                .kutsumanimi("Lemmy")
                .sukunimi("Kilmister")
                .hetu("")
                .kuolinpaiva(dod)
                .cleanupStep(CleanupStep.INITIATED)
                .created(dodDate)
                .modified(dodDate)
                .build();

        dataRepository.saveAndFlush(testiHenkilo);

        Collection<Henkilo> henkilos = dataRepository.findDeadWithIncompleteCleanup(CleanupStep.INITIATED);
        assertTrue("Incorrect result size", henkilos.isEmpty());
    }

    @Test
    public void findDeadWithIncompleteCleanupNotDeadYet() {
        LocalDate dod = LocalDate.now().plusDays(1);
        Date dodDate = Date.from(dod.atStartOfDay(ZoneId.systemDefault()).toInstant());

        Henkilo testiHenkilo = Henkilo.builder()
                .oidHenkilo(UUID.randomUUID().toString())
                .etunimet("Ernesto")
                .kutsumanimi("Che")
                .sukunimi("Guevara")
                .hetu("")
                .kuolinpaiva(dod)
                .created(dodDate)
                .modified(dodDate)
                .build();

        dataRepository.saveAndFlush(testiHenkilo);

        Collection<Henkilo> henkilos = dataRepository.findDeadWithIncompleteCleanup(CleanupStep.INITIATED);
        assertTrue("Incorrect result size", henkilos.isEmpty());
    }

    @Test
    public void findByKaikkiHetutReturnsMatch() {
        Henkilo toinenHenkilo = createTestHenkilo(TOINEN_HETU);
        dataRepository.saveAndFlush(toinenHenkilo);

        String toinenHetu = "111111-1239";
        Henkilo testiHenkilo = createTestHenkilo(TESTI_HETU);
        testiHenkilo.addHetu(toinenHetu);
        dataRepository.saveAndFlush(testiHenkilo);

        Optional<Henkilo> optHenkilo = dataRepository.findByKaikkiHetut(toinenHetu);
        assertTrue(optHenkilo.isPresent());
    }

    private Henkilo createTestHenkilo(String hetu) {
        Date now = new Date();
        return Henkilo.builder()
                .oidHenkilo(UUID.randomUUID().toString())
                .etunimet("Testi Henkilö")
                .kutsumanimi("Henkilö")
                .sukunimi("Testinovic")
                .hetu(hetu)
                .created(now)
                .modified(now)
                .build();
    }

    private Henkilo createHenkilo(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, Date luontiMuokkausSyncedPvm, Date lastVtjSynced, String kasittelija, String yhteystietoArvo, LocalDate syntymaAika) {
        Kielisyys kielisyys = kielikoodi != null ? new Kielisyys(kielikoodi, kielityyppi) : null;
        return Henkilo.builder()
                .oidHenkilo(oidHenkilo)
                .hetu(hetu)
                .etunimet(etunimet)
                .kutsumanimi(kutsumanimi)
                .sukunimi(sukunimi)
                .aidinkieli(kielisyys)
                .asiointiKieli(kielisyys)
                .created(luontiMuokkausSyncedPvm)
                .modified(luontiMuokkausSyncedPvm)
                .vtjsynced(lastVtjSynced)
                .passivoitu(passivoitu)
                .kansalaisuus(Sets.newHashSet(kansalaisuuskoodi != null ? new Kansalaisuus(kansalaisuuskoodi) : null))
                .yhteystiedotRyhma(Sets.newHashSet(new YhteystiedotRyhma(
                        "yhteystietotyyppi2",
                        "alkupera2",
                        false,
                        Collections.singleton(new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo)))))
                .kasittelijaOid(kasittelija)
                .syntymaaika(syntymaAika)
                .build();
    }

    @Test
    public void throwsWhenSearchingWithDuplicateIdentificationNoOid() {
        var duplicateIdentifier = "duplicateTunniste";
        var duplicateIdpEntityId = IdpEntityId.oppijaToken;

        // Add 2 people with the same identification (oppijaToken)
        // NOTE: this should be impossible, and should be prevented in source data
        var person1 = createTestHenkilo(
                TESTI_HETU,
                Set.of(
                        Identification.builder()
                                .identifier(duplicateIdentifier)
                                .idpEntityId(duplicateIdpEntityId)
                                .build()));
        dataRepository.saveAndFlush(person1);

        var person2 = createTestHenkilo(
                TOINEN_HETU,
                Set.of(
                        Identification.builder()
                        .identifier(duplicateIdentifier)
                        .idpEntityId(duplicateIdpEntityId)
                        .build()));
        dataRepository.saveAndFlush(person2);

        assertThrows(NonUniqueResultException.class, () -> {
            dataRepository.findByIdentification(IdentificationDto.of(duplicateIdpEntityId, duplicateIdentifier));
        });
    }

    private Henkilo createTestHenkilo(String hetu, Set<Identification> identifications) {
        Date now = new Date();
        return Henkilo.builder()
                .oidHenkilo(UUID.randomUUID().toString())
                .etunimet("Testi Henkilö")
                .kutsumanimi("Henkilö")
                .sukunimi("Testinovic")
                .hetu(hetu)
                .identifications(identifications)
                .created(now)
                .modified(now)
                .build();
    }
}
