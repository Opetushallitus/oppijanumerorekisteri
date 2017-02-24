package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.TestApplication;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.HenkiloPopulator.henkilo;
import static java.util.Collections.singletonList;
import static java.util.function.Predicate.isEqual;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
//@DataJpaTest
@Transactional(readOnly = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = TestApplication.class)
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)

public class HenkiloViiteRepositoryTests extends AbstractRepositoryTest {

    @Autowired
    private HenkiloViiteRepository henkiloViiteRepository;
    
    @Ignore
    @Test
    public void findHenkiloViitteesByHenkilo() {
        populate(henkilo("CHILD1").withMaster(henkilo("ROOT")));
        populate(henkilo("CHILD2").withMaster(henkilo("ROOT")));
        populate(henkilo("UNRELATED_CHILD").withMaster(henkilo("ROOT2")));
        populate(henkilo("CHILD3").withMaster(henkilo("ROOT3")));

        // Search by root:
        List<HenkiloViiteDto> results = this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(singletonList("ROOT"))).build());
        assertThat(results).hasSize(2);
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("CHILD1", "CHILD2");
        assertThat(results.stream().map(HenkiloViiteDto::getMasterOid).collect(toSet()))
                .allMatch(isEqual("ROOT"));

        // Search by child:
        results = this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(singletonList("CHILD1"))).build());
        assertThat(results).hasSize(2);
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("CHILD1", "CHILD2");
        assertThat(results.stream().map(HenkiloViiteDto::getMasterOid).collect(toSet()))
                .allMatch(isEqual("ROOT"));

        // Search without search terms (returns all graphs):
        results = this.henkiloViiteRepository.findBy(new HenkiloCriteria());
        assertThat(results).hasSize(4);
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("CHILD1", "CHILD2", "UNRELATED_CHILD", "CHILD3");

        // Cause CHILD2 to have two masters (ROOT and ROOT3) (error in db):
        HenkiloViite doubleParent = new HenkiloViite();
        doubleParent.setMasterOid("CHILD2");
        doubleParent.setSlaveOid("ROOT3");
        em.persist(doubleParent);

        // This would not cause errors in query:
        results = this.henkiloViiteRepository.findBy(HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(singletonList("CHILD2"))).build());
        assertThat(results).hasSize(3); // just one extra row
        assertThat(results.stream().map(HenkiloViiteDto::getHenkiloOid).collect(toSet()))
                .contains("CHILD1", "CHILD2");
        assertThat(results.stream().map(HenkiloViiteDto::getMasterOid).collect(toSet()))
                .contains("ROOT");

        // Cause an invalid loop in the graph (error in db):
        HenkiloViite invalidViite = new HenkiloViite();
        invalidViite.setMasterOid("CHILD2");
        invalidViite.setSlaveOid("ROOT");
        em.persist(invalidViite);

        // This query will still not hang:
        results = this.henkiloViiteRepository.findBy(new HenkiloCriteria());
        assertThat(results).hasSize(6); // just some extra rows
    }
}
