package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.DatabaseService;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiVirheDto;
import fi.vm.sade.oppijanumerorekisteri.enums.YksilointivirheTila;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointivirhe;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.MockVtjClient;
import org.assertj.core.groups.Tuple;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.junit.After;
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
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

// Non-transactional in order to emulate how the real method call works. Thus db is not rolled back after tests.
// See IdentificationServiceIntegrationTests if you want to add more tests.
@RunWith(SpringRunner.class)
@IntegrationTest
@Sql("/sql/yksilointi-test.sql")
public class IdentificationServiceIntegrationTest {
    @MockBean
    private VtjClient vtjClient;

    private MockVtjClient mockVtjClient;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private KoodistoClient koodistoClient;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private DatabaseService databaseService;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private OrikaSpringMapper mapper;

    @Before
    public void setup() {
        this.mockVtjClient = new MockVtjClient();
        this.mockVtjClient.setUsedFixture("/vtj-testdata/vtj-response-ok.json");

        given(this.koodistoClient.getKoodisForKoodisto(anyString(), anyInt(), anyBoolean()))
                .willReturn(new KoodiTypeListBuilder(Koodisto.MAAT_JA_VALTIOT_2).koodi("752").koodi("246").build());
    }

    @After
    public void cleanup() {
        databaseService.truncate();
    }

    @Test
    public void identifyHenkilos() {
        List<Henkilo> unidentifiedHenkilos = this.entityManager
                .createQuery("SELECT h FROM Henkilo h", Henkilo.class).getResultList();

        given(this.vtjClient.fetchHenkilo("111111-1235")).willReturn(Optional.empty());
        given(this.vtjClient.fetchHenkilo("010101-123N"))
                .willReturn(this.mockVtjClient.fetchHenkilo(""));

        this.identificationService.identifyHenkilos(unidentifiedHenkilos, 0L);

        Henkilo notFoundVtjResult = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.hetu = '111111-1235'", Henkilo.class).getSingleResult();
        Henkilo everythingOkResult = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.hetu = '010101-123N'", Henkilo.class).getSingleResult();

        assertThat(everythingOkResult.isYksiloityVTJ()).isTrue();
        assertThat(everythingOkResult.getKutsumanimi()).isEqualTo("Teppo");

        assertThat(notFoundVtjResult.isYksiloityVTJ()).isFalse();
        assertThat(notFoundVtjResult.isYksilointiYritetty()).isTrue();

        List<Yksilointivirhe> yksilointivirhe = this.entityManager
                .createQuery("SELECT y FROM Yksilointivirhe y", Yksilointivirhe.class).getResultList();
        assertThat(this.mapper.mapAsList(yksilointivirhe, YksilointiVirheDto.class))
                .extracting(YksilointiVirheDto::getUudelleenyritysAikaleima, YksilointiVirheDto::getYksilointivirheTila)
                .containsExactlyInAnyOrder(Tuple.tuple(null, YksilointivirheTila.HETU_EI_VTJ),
                        Tuple.tuple(null, YksilointivirheTila.HETU_EI_VTJ));
    }
}
