package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.MockKoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.services.MockVtjClient;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.*;

// Non-transactional in order to emulate how the real method call works.
@RunWith(SpringRunner.class)
@IntegrationTest
@Sql("/sql/yksilointi-test.sql")
public class IdentificationServiceIntegrationTest {
    @MockBean
    private VtjClient vtjClient;

    private MockVtjClient mockVtjClient;

    @MockBean
    private KoodistoClient koodistoClient;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private HenkiloRepository henkiloRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Before
    public void setup() {
        this.mockVtjClient = new MockVtjClient();
        this.mockVtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");
        MockKoodistoClient mockKoodistoClient = new MockKoodistoClient();

        given(this.koodistoClient.getKoodiValuesForKoodisto(anyString(), anyInt(), anyBoolean()))
                .willReturn(mockKoodistoClient.getKoodiValuesForKoodisto("maatjavaltiot2", 0, true));
    }

    @Test
    public void identifyHenkilos() {
        @SuppressWarnings("unchedked")
        List<Henkilo> unidentifiedHenkilos = this.entityManager.createNativeQuery("SELECT * FROM henkilo", Henkilo.class).getResultList();

        given(this.vtjClient.fetchHenkilo("111111-1235")).willReturn(Optional.empty());
        given(this.vtjClient.fetchHenkilo("010101-123N"))
                .willReturn(this.mockVtjClient.fetchHenkilo(""));

        this.identificationService.identifyHenkilos(unidentifiedHenkilos, 0L);

        Henkilo notFoundVtjResult = (Henkilo)this.entityManager.createNativeQuery("SELECT * FROM henkilo WHERE hetu = '111111-1235'", Henkilo.class).getSingleResult();
        Henkilo everythingOkResult = (Henkilo)this.entityManager.createNativeQuery("SELECT * FROM henkilo WHERE hetu = '010101-123N'", Henkilo.class).getSingleResult();

        assertThat(everythingOkResult.isYksiloityVTJ()).isTrue();
        assertThat(everythingOkResult.getKutsumanimi()).isEqualTo("Teppo");

        assertThat(notFoundVtjResult.isYksiloityVTJ()).isFalse();
        assertThat(notFoundVtjResult.isYksilointiYritetty()).isTrue();
    }

}
