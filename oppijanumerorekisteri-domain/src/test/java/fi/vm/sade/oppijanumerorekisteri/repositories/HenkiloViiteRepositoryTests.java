package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.HenkiloPopulator.henkilo;
import static java.util.Collections.singletonList;
import static java.util.function.Predicate.isEqual;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional(readOnly = true)
public class HenkiloViiteRepositoryTests extends AbstractRepositoryTest {

    @Autowired
    private HenkiloViiteRepository henkiloViiteRepository;
    
    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void findHenkiloViitteesByHenkilo() {
        populate(henkilo("1.2.3.4.1").withMaster(henkilo("1.2.3.4.0"))); // CHILD1 - ROOT
        populate(henkilo("1.2.3.4.2").withMaster(henkilo("1.2.3.4.0"))); // CHILD2 - ROOT
        populate(henkilo("1.2.3.5.1").withMaster(henkilo("1.2.3.5.0"))); // UNRELATED_CHILD - ROOT2
        populate(henkilo("1.2.3.6.1").withMaster(henkilo("1.2.3.6.0"))); // CHILD3 - ROOT3

        // Search by root:
        List<HenkiloViiteDto> results = this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(singletonList("1.2.3.4.0"))).build());
        assertThat(results).hasSize(2);
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("1.2.3.4.1", "1.2.3.4.2");
        assertThat(results.stream().map(HenkiloViiteDto::getMasterOid).collect(toSet()))
                .allMatch(isEqual("1.2.3.4.0"));

        // Search large queryset (80+)
        Set<String> henkiloOids = new HashSet<>();
        for(int i=1; i<100; i++) {
            henkiloOids.add("1.2.3.4." + i);
        }
        henkiloOids.add("1.2.3.6.1");
        results = this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(henkiloOids).build());
        assertThat(results).hasSize(3);
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("1.2.3.4.1", "1.2.3.4.2", "1.2.3.6.1");
        assertThat(results.stream().map(HenkiloViiteDto::getMasterOid).collect(toSet()))
                .contains("1.2.3.4.0", "1.2.3.6.0");

        // Search by child:
        results = this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(singletonList("1.2.3.4.1"))).build());
        assertThat(results).hasSize(2);
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("1.2.3.4.1", "1.2.3.4.2");
        assertThat(results.stream().map(HenkiloViiteDto::getMasterOid).collect(toSet()))
                .allMatch(isEqual("1.2.3.4.0"));

        // Search without search terms (returns all graphs):
        results = this.henkiloViiteRepository.findBy(new HenkiloCriteria());
        assertThat(results).hasSize(4);
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("1.2.3.4.1", "1.2.3.4.2", "1.2.3.5.1", "1.2.3.6.1");

        // Cause 1.2.3.4.2 to have two masters (ROOT and 1.2.3.6.0) (error in db):
        HenkiloViite doubleParent = new HenkiloViite();
        doubleParent.setMasterOid("1.2.3.4.2");
        doubleParent.setSlaveOid("1.2.3.6.0");
        em.persist(doubleParent);

        // This would not cause errors in query:
        results = this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(singletonList("1.2.3.4.2"))).build());
        assertThat(results).hasSize(3); // just one extra row
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("1.2.3.4.1", "1.2.3.4.2");
        assertThat(results.stream().map(HenkiloViiteDto::getMasterOid).collect(toSet()))
                .contains("1.2.3.4.0");

        // Cause an invalid loop in the graph (error in db):
        HenkiloViite invalidViite = new HenkiloViite();
        invalidViite.setMasterOid("1.2.3.4.2");
        invalidViite.setSlaveOid("1.2.3.4.0");
        em.persist(invalidViite);

        // This query will still not hang:
        results = this.henkiloViiteRepository.findBy(new HenkiloCriteria());
        assertThat(results).hasSize(6); // just some extra rows
    }

    @Test(expected = IndexOutOfBoundsException.class)
    public void largeSetsDoesNotAllowBadCharacters() {
        // Search large queryset (80+)
        Set<String> henkiloOids = new HashSet<>();
        for(int i=1; i<100; i++) {
            henkiloOids.add("1.2.3.4.df" + i);
        }
        this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(henkiloOids).build());
    }
}
