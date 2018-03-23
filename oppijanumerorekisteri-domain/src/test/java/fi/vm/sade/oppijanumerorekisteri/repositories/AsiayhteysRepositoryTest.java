package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.AsiayhteysCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.impl.AsiayhteysRepositoryImpl;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

@RunWith(SpringRunner.class)
@DataJpaTest
@Import(AsiayhteysRepositoryImpl.class)
@Transactional(readOnly = true)
public class AsiayhteysRepositoryTest {

    @Autowired
    private AsiayhteysRepository asiayhteysRepository;

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void findNotVtjRegisterHenkilos() {
        Henkilo henkilo1 = Henkilo.builder()
                .oidHenkilo("1")
                .modified(new Date())
                .created(new Date())
                .hetu("hetu1")
                .passivoitu(false)
                .vtjRegister(false)
                .yksiloityVTJ(true)
                .build();
        this.testEntityManager.persistAndFlush(henkilo1);

        Henkilo henkilo2 = Henkilo.builder()
                .oidHenkilo("2")
                .modified(new Date())
                .created(new Date())
                .hetu("hetu2")
                .passivoitu(false)
                .vtjRegister(false)
                .yksiloityVTJ(false)
                .build();
        this.testEntityManager.persistAndFlush(henkilo2);

        Henkilo henkilo3 = Henkilo.builder()
                .oidHenkilo("3")
                .modified(new Date())
                .created(new Date())
                .hetu(null)
                .passivoitu(false)
                .vtjRegister(false)
                .yksiloityVTJ(true)
                .build();
        this.testEntityManager.persistAndFlush(henkilo3);

        AsiayhteysCriteria criteria = new AsiayhteysCriteria(LocalDate.now());
        List<Henkilo> henkilos = asiayhteysRepository.findLisattavat(criteria, 5000L);

        assertThat(henkilos).extracting(Henkilo::getOidHenkilo).containsExactly("1");
    }

}
