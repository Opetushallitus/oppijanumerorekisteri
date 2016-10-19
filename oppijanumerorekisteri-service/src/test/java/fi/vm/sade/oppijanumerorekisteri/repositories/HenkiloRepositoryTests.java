package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloTyyppi;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional(readOnly = true)
public class HenkiloRepositoryTests extends AbstractRepositoryTest {
    @Autowired
    private HenkiloHibernateRepository repository;

    @Test
    public void userHasHetu() {
        Henkilo henkilo = new Henkilo();
        henkilo.setHetu("123456");
        henkilo.setOidhenkilo("1.2.3.4.5.6");
        henkilo.setHenkilotyyppi(HenkiloTyyppi.VIRKAILIJA);
        this.testEntityManager.persist(henkilo);
        String hetu = this.repository.getHetuByOid("1.2.3.4.5.6");
        assertThat(hetu.equals("123456"));
    }

    @Test
    public void userHasNoHetu() {
        Henkilo henkilo = new Henkilo();
        henkilo.setHetu("");
        henkilo.setOidhenkilo("1.2.3.4.5.6");
        henkilo.setHenkilotyyppi(HenkiloTyyppi.VIRKAILIJA);
        this.testEntityManager.persist(henkilo);
        String hetu = this.repository.getHetuByOid("1.2.3.4.5.6");
        assertThat(hetu.isEmpty());
    }

    @Test
    public void userOidNotInDb() {
        String hetu = this.repository.getHetuByOid("unknown oid");
        assertThat(hetu == null);
    }
}
