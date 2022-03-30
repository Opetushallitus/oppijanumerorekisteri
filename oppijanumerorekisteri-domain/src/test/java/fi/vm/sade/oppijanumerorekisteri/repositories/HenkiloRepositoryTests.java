package fi.vm.sade.oppijanumerorekisteri.repositories;

import com.google.common.collect.Sets;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import javax.persistence.PersistenceException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.util.*;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi.*;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.HenkiloPopulator.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.TuontiPopulator.tuonti;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.YhteystiedotRyhmaPopulator.ryhma;
import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional
public class HenkiloRepositoryTests extends AbstractRepositoryTest {

    private static final String TESTI_HETU = "111111-1119";
    private static final String TOINEN_HETU = "121212-1219";

    @Autowired
    private HenkiloRepository dataRepository;

    @Autowired
    private TestEntityManager testEntityManager;

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
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.persistHenkilo(henkilo);
        Optional<String> hetu = this.dataRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu).hasValue("123456-9999");
    }

    @Test
    public void findHetuByOidNoHetu() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.persistHenkilo(henkilo);
        Optional<String> hetu = this.dataRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu).hasValue("");
    }

    @Test
    public void findOidByHetu() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
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
        Henkilo henkiloWithNullOid = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", null, false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.persistHenkilo(henkiloWithNullOid);
    }

    @Test
    public void findByOidhenkiloIsIn() {
        Date luontiMuokkausPvm = new Date();
        Henkilo assertHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.persistHenkilo(persistedHenkilo);
        List<Henkilo> resultHenkiloList = this.dataRepository.findByOidHenkiloIsIn(Collections.singletonList("1.2.3.4.5"));
        persistedHenkilo = resultHenkiloList.get(0);
        assertThat(persistedHenkilo).isEqualToIgnoringGivenFields(assertHenkilo, "id", "version", "yhteystiedotRyhma", "vtjsynced");
        assertThat(persistedHenkilo.getYhteystiedotRyhma().size()).isEqualTo(assertHenkilo.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(persistedHenkilo.getYhteystiedotRyhma().iterator().next())
                .isEqualToIgnoringGivenFields(assertHenkilo.getYhteystiedotRyhma().iterator().next(), "id", "version", "henkilo", "yhteystieto");
        Set<Yhteystieto> persistedYhteystieto = persistedHenkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        Set<Yhteystieto> yhteystieto = assertHenkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        assertThat(persistedYhteystieto.size()).isEqualTo(yhteystieto.size()).isEqualTo(1);
        assertThat(persistedYhteystieto.iterator().next()).isEqualToIgnoringGivenFields(yhteystieto.iterator().next(), "id", "version", "yhteystiedotRyhma");
    }

    @Test
    public void findByOidIn() {
        LocalDate syntymaaika = LocalDate.of(2016, Month.DECEMBER, 20);
        Date luontiMuokkausPvm = new Timestamp(System.currentTimeMillis());
        HenkiloPerustietoDto assertHenkilo = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                "fi", "suomi", "246", null, null, syntymaaika, luontiMuokkausPvm);
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", syntymaaika);
        this.testEntityManager.persist(persistedHenkilo.getAsiointiKieli());
        persistedHenkilo.getKansalaisuus().forEach(kansalaisuus -> this.testEntityManager.persist(kansalaisuus));
        this.testEntityManager.persist(persistedHenkilo);
        this.testEntityManager.flush();
        List<HenkiloPerustietoDto> resultHenkiloList = this.dataRepository.findByOidIn(Collections.singletonList("1.2.3.4.5"));
        assertThat(resultHenkiloList.get(0)).isEqualToComparingFieldByFieldRecursively(assertHenkilo);
    }

    @Test
    public void findByHetu() {
        Date luontiMuokkausPvm = new Date();
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.persistHenkilo(persistedHenkilo);
        persistedHenkilo = this.dataRepository.findByHetu("123456-9999").orElse(null);
        assertThat(persistedHenkilo).isEqualToIgnoringGivenFields(henkilo, "id", "version", "yhteystiedotRyhma", "vtjsynced");
        assertThat(persistedHenkilo.getYhteystiedotRyhma().size()).isEqualTo(henkilo.getYhteystiedotRyhma().size()).isEqualTo(1);
        assertThat(persistedHenkilo.getYhteystiedotRyhma().iterator().next())
                .isEqualToIgnoringGivenFields(henkilo.getYhteystiedotRyhma().iterator().next(), "id", "version", "henkilo", "yhteystieto");
        Set<Yhteystieto> persistedYhteystieto = persistedHenkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        Set<Yhteystieto> yhteystieto = henkilo.getYhteystiedotRyhma().iterator().next().getYhteystieto();
        assertThat(persistedYhteystieto.size()).isEqualTo(yhteystieto.size()).isEqualTo(1);
        assertThat(persistedYhteystieto.iterator().next()).isEqualToIgnoringGivenFields(yhteystieto.iterator().next(), "id", "version", "yhteystiedotRyhma");
    }

    @Test
    public void findYhteystiedot() {
        populate(henkilo("1.2.3.4.5")
                .withYhteystieto(ryhma("yhteystietotyyppi1")
                        .alkupera("alkuperä")
                        .tieto(YHTEYSTIETO_KATUOSOITE, "Kotikatu 3")
                        .tieto(YHTEYSTIETO_POSTINUMERO, "12345")
                        .tieto(YHTEYSTIETO_KAUPUNKI, "Toijala")
                )
                .withYhteystieto(ryhma("yhteystietotyyppi2").alkupera("alkuperä")
                        .tieto(YHTEYSTIETO_SAHKOPOSTI, "tyo@osoite.com")
                )
        );

        List<YhteystietoHakuDto> tiedot = this.dataRepository.findYhteystiedot(new YhteystietoCriteria());
        assertThat(tiedot.size()).isEqualTo(4);

        tiedot = this.dataRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("non-existing"));
        assertThat(tiedot.size()).isEqualTo(0);

        tiedot = this.dataRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("1.2.3.4.5"));
        assertThat(tiedot.size()).isEqualTo(4);

        tiedot = this.dataRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("1.2.3.4.5")
                .withRyhma("yhteystietotyyppi2"));
        assertThat(tiedot.size()).isEqualTo(1);
        assertThat(tiedot.get(0).getArvo()).isEqualTo("tyo@osoite.com");
        assertThat(tiedot.get(0).getHenkiloOid()).isEqualTo("1.2.3.4.5");
        assertThat(tiedot.get(0).getRyhmaAlkuperaTieto()).isEqualTo("alkuperä");
        assertThat(tiedot.get(0).getRyhmaKuvaus()).isEqualTo("yhteystietotyyppi2");
        assertThat(tiedot.get(0).getHenkiloOid()).isEqualTo("1.2.3.4.5");
    }

    @Test
    public void findHetusAndOids() {
        Date vtjSyncedDate = new Date();
        Henkilo henkilo = EntityUtils.createHenkilo("", "", "", "123456-9999", "1.2.3.4.5", false,
                "", "", "", new Date(), vtjSyncedDate, "1.2.3.4.1", "arpa@kuutio.fi");
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("", "", "", "123456-9999", "1.2.3.4.5", false,
                "", "", "", new Date(), vtjSyncedDate, "1.2.3.4.1", "arpa@kuutio.fi");
        this.testEntityManager.persist(persistedHenkilo);

        Henkilo retrievedHenkilo = this.dataRepository.findHetusAndOids(null, 0, 100).get(0);

        assertThat(retrievedHenkilo).isEqualToComparingOnlyGivenFields(henkilo, "oidHenkilo", "hetu");
        assertThat(henkilo.getVtjsynced()).hasSameTimeAs(retrievedHenkilo.getVtjsynced());
    }

    @Test
    public void findHetusAndOidsSyncedBefore() {
        List<Henkilo> persistentHenkilos = asList(
                EntityUtils.createHenkilo("", "", "", "123456-9999", "1.2.3.4.5", false,
                        "", "", "", new Date(), null, "1.2.3.4.1", "arpa@kuutio.fi"),
                EntityUtils.createHenkilo("", "", "", "123456-9998", "1.2.3.4.6", false,
                        "", "", "", new Date(), new Date(101L), "1.2.3.4.1", "arpa@kuutio.fi"),
                EntityUtils.createHenkilo("", "", "", "123456-9997", "1.2.3.4.7", false,
                        "", "", "", new Date(), new Date(102L), "1.2.3.4.1", "arpa@kuutio.fi"),
                EntityUtils.createHenkilo("", "", "", "123456-9996", "1.2.3.4.8", false,
                        "", "", "", new Date(), new Date(103L), "1.2.3.4.1", "arpa@kuutio.fi")
        );

        for (Henkilo persistentHenkilo : persistentHenkilos) {
            this.testEntityManager.persist(persistentHenkilo);
        }

        List<Henkilo> retrievedHenkilos = this.dataRepository.findHetusAndOids(null, 0, 100);
        assertThat(retrievedHenkilos.size()).isEqualTo(4);

        retrievedHenkilos = this.dataRepository.findHetusAndOids(101L, 0, 100);
        assertThat(retrievedHenkilos.size()).isEqualTo(1);

        retrievedHenkilos = this.dataRepository.findHetusAndOids(102L, 0, 100);
        assertThat(retrievedHenkilos.size()).isEqualTo(2);

        retrievedHenkilos = this.dataRepository.findHetusAndOids(103L, 0, 100);
        assertThat(retrievedHenkilos.size()).isEqualTo(3);
    }

    @Test
    public void findHetusAndOidsPagination() {
        List<Henkilo> persistentHenkilos = asList(
                EntityUtils.createHenkilo("", "", "", "123456-9999", "1.2.3.4.5", false,
                        "", "", "", new Date(), null, "1.2.3.4.1", "arpa@kuutio.fi"),
                EntityUtils.createHenkilo("", "", "", "123456-9998", "1.2.3.4.6", false,
                        "", "", "", new Date(), null, "1.2.3.4.1", "arpa@kuutio.fi"),
                EntityUtils.createHenkilo("", "", "", "123456-9997", "1.2.3.4.7", false,
                        "", "", "", new Date(), null, "1.2.3.4.1", "arpa@kuutio.fi"),
                EntityUtils.createHenkilo("", "", "", "123456-9996", "1.2.3.4.8", false,
                        "", "", "", new Date(), null, "1.2.3.4.1", "arpa@kuutio.fi")
        );

        for (Henkilo persistentHenkilo : persistentHenkilos) {
            this.testEntityManager.persist(persistentHenkilo);
        }

        List<Henkilo> retrievedHenkilos = this.dataRepository.findHetusAndOids(null, 0, 100);
        assertThat(retrievedHenkilos.size()).isEqualTo(4);

        retrievedHenkilos = this.dataRepository.findHetusAndOids(101L, 0, 3);
        assertThat(retrievedHenkilos.size()).isEqualTo(3);

        retrievedHenkilos = this.dataRepository.findHetusAndOids(102L, 1, 100);
        assertThat(retrievedHenkilos.size()).isEqualTo(3);
    }

    @Test
    public void findHetusAndOidsSorting() {
        List<Henkilo> persistentHenkilos = asList(
                EntityUtils.createHenkilo("", "", "", "123456-9999", "1.2.3.4.5", false,
                        "", "", "", new Date(), new Date(), "1.2.3.4.1", null), // should be 4th
                EntityUtils.createHenkilo("", "", "", "123456-9998", "1.2.3.4.6", false,
                        "", "", "", new Date(), null, "1.2.3.4.1", null),        // should be 1st or 2nd
                EntityUtils.createHenkilo("", "", "", "123456-9997", "1.2.3.4.7", false,
                        "", "", "", new Date(), new Date(1), "1.2.3.4.1", null), // should be 3rd
                EntityUtils.createHenkilo("", "", "", "123456-9996", "1.2.3.4.8", false,
                        "", "", "", new Date(), null, "1.2.3.4.1", null)         // should be 1st or 2nd
        );

        for (Henkilo persistentHenkilo : persistentHenkilos) {
            this.testEntityManager.persistAndFlush(persistentHenkilo);
        }

        List<Henkilo> retrievedHenkilos = this.dataRepository.findHetusAndOids(null, 0, 100);

        // null vtjsync first
        assertThat(retrievedHenkilos.get(0).getOidHenkilo()).isIn(asList("1.2.3.4.6", "1.2.3.4.8"));
        assertThat(retrievedHenkilos.get(1).getOidHenkilo()).isIn(asList("1.2.3.4.6", "1.2.3.4.8"));
        // then by date
        assertThat(retrievedHenkilos.get(2).getOidHenkilo()).isEqualTo("1.2.3.4.7");
        assertThat(retrievedHenkilos.get(3).getOidHenkilo()).isEqualTo("1.2.3.4.5");
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
        assertThat(results).containsAll(Sets.newHashSet("1_MINUTE_AGO", "2_MINUTES_AGO", "3_MINUTES_AGO", "4_MINUTES_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 2, null);
        assertThat(results).hasSize(2);
        assertThat(results).containsAll(Sets.newHashSet("2_MINUTES_AGO", "1_MINUTE_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), null, 2);
        assertThat(results).hasSize(2);
        assertThat(results).containsAll(Sets.newHashSet("4_MINUTES_AGO", "3_MINUTES_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 1, 1);
        assertThat(results).hasSize(1);
        assertThat(results).containsAll(Sets.newHashSet("3_MINUTES_AGO"));

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 100, 100);
        assertThat(results).hasSize(0);

        results = this.dataRepository.findOidsModifiedSince(new HenkiloCriteria(), now.minusHours(1), 1, 100);
        System.out.println(results);
        assertThat(results).hasSize(3);
        assertThat(results).containsAll(Sets.newHashSet("3_MINUTES_AGO", "2_MINUTES_AGO", "1_MINUTE_AGO"));

    }

    @Test
    public void findPerustiedotByHetuIn() {
        LocalDate syntymaaika = LocalDate.of(2016, Month.DECEMBER, 20);
        Date luontiMuokkausPvm = new Timestamp(System.currentTimeMillis());
        HenkiloPerustietoDto assertHenkilo = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                "fi", "suomi", "246", null, null, syntymaaika, luontiMuokkausPvm);
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", syntymaaika);
        this.testEntityManager.persist(persistedHenkilo.getAsiointiKieli());
        persistedHenkilo.getKansalaisuus().forEach(kansalaisuus -> this.testEntityManager.persist(kansalaisuus));
        this.testEntityManager.persist(persistedHenkilo);
        this.testEntityManager.flush();
        List<HenkiloPerustietoDto> resultHenkiloList = this.dataRepository.findPerustiedotByHetuIn(Collections.singletonList("123456-9999"));
        assertThat(resultHenkiloList.get(0)).isEqualToComparingFieldByFieldRecursively(assertHenkilo);
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
        ).aikaleima((new DateTime()).minusMonths(OppijaTuontiCriteria.SANITATION_THRESHOLD + 1).toDate())); // older than two months - subject to sanitation

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

        criteria.setSanitized(true);
        assertThat(dataRepository.findBy(criteria, Integer.MAX_VALUE, 0, null))
                .extracting(Henkilo::getOidHenkilo, Henkilo::getYksilointiTila)
                .containsExactlyInAnyOrder(
                        tuple("hetuton", YksilointiTila.HETU_PUUTTUU),
                        tuple("hetullinen_yksilointi_yritetty", YksilointiTila.VIRHE));
    }

    @Test
    public void findByOppijaTuontiCriteriaSanitationSkipsRecentTest() {
        populate(tuonti(
                henkilo("hetuton"),
                henkilo("hetuton_yksiloity").yksiloity(),
                henkilo("hetullinen").hetu("251098-9515"),
                henkilo("hetullinen_yksilointi_yritetty").hetu("251098-991E").yksilointiYritetty(),
                henkilo("hetullinen_yksiloity").hetu("251098-937P").yksiloityVtj(),
                henkilo("passivoitu").passivoitu(),
                henkilo("duplikaatti").duplikaatti()
        ).aikaleima((new DateTime()).minusMonths(OppijaTuontiCriteria.SANITATION_THRESHOLD - 1).toDate())); // newer than two months - no sanitation

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

        criteria.setSanitized(true);
        assertThat(dataRepository.findBy(criteria, Integer.MAX_VALUE, 0, null))
                .extracting(Henkilo::getOidHenkilo, Henkilo::getYksilointiTila)
                .containsExactlyInAnyOrder(
                        tuple("hetuton", YksilointiTila.HETU_PUUTTUU),
                        tuple("hetuton_yksiloity", YksilointiTila.OK),
                        tuple("hetullinen", YksilointiTila.KESKEN),
                        tuple("hetullinen_yksilointi_yritetty", YksilointiTila.VIRHE),
                        tuple("hetullinen_yksiloity", YksilointiTila.OK));
    }

    private void persistHenkilo(Henkilo henkilo) {
        this.testEntityManager.persistAndFlush(henkilo.getAidinkieli());
        if (!CollectionUtils.isEmpty(henkilo.getKansalaisuus())) {
            henkilo.getKansalaisuus().forEach(kansalaisuus -> this.testEntityManager.persistAndFlush(kansalaisuus));
        }
        this.testEntityManager.persistAndFlush(henkilo);
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
}
