package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional(readOnly = true)
public class IdentificationRepositoryTest {
    @Autowired
    private IdentificationRepository identificationRepository;

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void findByidpentityidAndIdentifier() throws Exception {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        this.testEntityManager.persist(henkilo);
        Identification identification = new Identification(henkilo, "oppijaToken", "testikayttaja@posti.fi", null, null, new Date());
        this.testEntityManager.persist(identification);

        Optional<Identification> foundIdentification = this.identificationRepository.
                findByidpentityidAndIdentifier("oppijaToken", "testikayttaja@posti.fi");
        assertThat(foundIdentification).hasValue(identification);

    }
}