package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloTyyppi;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional(readOnly = true)
public class HenkiloRepositoryTests {

    @Autowired
    private HenkiloHibernateRepository repository;

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void userHasHetu() {
        Henkilo henkilo = new Henkilo();
        henkilo.setHetu("123456");
        henkilo.setOidhenkilo("1.2.3.4.5.6");
        henkilo.setHenkilotyyppi(HenkiloTyyppi.VIRKAILIJA);
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.repository.findHetuByOid("1.2.3.4.5.6");
        assertThat(hetu.orElse("").equals("123456"));
    }

    @Test
    public void userHasNoHetu() {
        Henkilo henkilo = new Henkilo();
        henkilo.setHetu("");
        henkilo.setOidhenkilo("1.2.3.4.5.6");
        henkilo.setHenkilotyyppi(HenkiloTyyppi.VIRKAILIJA);
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.repository.findHetuByOid("1.2.3.4.5.6");
        assertThat(hetu.orElse("").isEmpty());
    }

    @Test
    public void userOidNotInDb() {
        Optional<String> hetu = this.repository.findHetuByOid("unknown oid");
        assertThat(hetu.isPresent()).isFalse();
    }
}
