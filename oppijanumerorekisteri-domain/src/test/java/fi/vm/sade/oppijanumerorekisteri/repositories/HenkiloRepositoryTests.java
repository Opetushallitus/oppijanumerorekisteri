package fi.vm.sade.oppijanumerorekisteri.repositories;

import com.google.common.collect.Sets;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHakuDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloYhteystietoDto;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi.*;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.HenkiloPopulator.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.YhteystiedotRyhmaPopulator.ryhma;
import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional(readOnly = true)
public class HenkiloRepositoryTests extends AbstractRepositoryTest {

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
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.dataRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu).hasValue("123456-9999");
    }

    @Test
    public void findHetuByOidNoHetu() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.dataRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu).hasValue("");
    }

    @Test
    public void findOidByHetu() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.testEntityManager.persist(henkilo);
        Optional<String> oid = this.dataRepository.findOidByHetu("123456-9999");
        assertThat(oid).hasValue("1.2.3.4.5");
    }

    @Test
    public void userOidNotInDb() {
        Optional<String> hetu = this.dataRepository.findHetuByOid("unknown oid");
        assertThat(hetu).isEmpty();
    }

    @Test(expected = DataIntegrityViolationException.class)
    public void createUserWithNullOid() {
        Henkilo henkiloWithNullOid = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", null, false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.dataRepository.save(henkiloWithNullOid);
    }

    @Test
    public void findByOidhenkiloIsIn() {
        Date luontiMuokkausPvm = new Date();
        Henkilo assertHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.testEntityManager.persist(persistedHenkilo);
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
        persistedHenkilo.getAidinkieli().setHenkilos(Collections.singleton(persistedHenkilo));
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
        this.testEntityManager.persist(persistedHenkilo);
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
    public void findHenkiloOidHetuNimisByEtunimetOrSukunimi() {
        Date luontiMuokkausPvm = new Date();
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", luontiMuokkausPvm, new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.testEntityManager.persist(persistedHenkilo);
        List<Henkilo> persistedHenkiloList = this.dataRepository.findHenkiloOidHetuNimisByEtunimetOrSukunimi(Collections.singletonList("arpa"), "kuutio");
        persistedHenkilo = persistedHenkiloList.get(0);
        assertThat(persistedHenkilo).isEqualToComparingOnlyGivenFields(henkilo, "etunimet", "kutsumanimi", "sukunimi",
                "oidHenkilo", "hetu");
    }

    @Test
    public void findYhteystiedot() {
        populate(henkilo("1.2.3.4.5")
            .withYhteystieto(ryhma("yhteystietotyyppi1")
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
            this.testEntityManager.persist(persistentHenkilo);
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

}
