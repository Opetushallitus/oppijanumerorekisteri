package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointivirheRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.MockVtjClient;
import software.amazon.awssdk.services.sns.SnsClient;

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

import static fi.vm.sade.oppijanumerorekisteri.AssertPublished.assertPublished;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.AdditionalMatchers.not;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

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
    private SnsClient snsClient;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private KoodistoClient koodistoClient;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private DatabaseService databaseService;

    @Autowired
    private ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private OrikaSpringMapper mapper;

    @Autowired
    private YksilointivirheRepository yksilointivirheRepository;

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

        assertPublished(objectMapper, snsClient, 1, everythingOkResult.getOidHenkilo());
    }

    @Test
    public void yksilointivirhe() {
        List<Henkilo> unidentifiedHenkilos = this.entityManager
                .createQuery("SELECT h FROM Henkilo h", Henkilo.class).getResultList();

        given(this.vtjClient.fetchHenkilo("111111-1235")).willReturn(Optional.empty());
        given(this.vtjClient.fetchHenkilo("010101-123N"))
                .willReturn(this.mockVtjClient.fetchHenkilo(""));

        this.identificationService.identifyHenkilos(unidentifiedHenkilos, 0L);

        List<Yksilointivirhe> yksilointivirhe = this.entityManager
                .createQuery("SELECT y FROM Yksilointivirhe y", Yksilointivirhe.class).getResultList();
        assertThat(this.mapper.mapAsList(yksilointivirhe, YksilointiVirheDto.class))
                .extracting(YksilointiVirheDto::getUudelleenyritysAikaleima, YksilointiVirheDto::getYksilointivirheTila)
                .containsExactlyInAnyOrder(
                        Tuple.tuple(null, YksilointivirheTila.HETU_EI_OIKEA),
                        Tuple.tuple(null, YksilointivirheTila.HETU_EI_VTJ),
                        Tuple.tuple(null, YksilointivirheTila.HETU_EI_VTJ));
    }

    @Test
    public void identifyHenkilosToimiiJosHenkilollaOnOllutToinenHetu() {
        List<Henkilo> yksiloimattomat = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE hetu IN ('111111-1234', '010101-123N') ORDER BY id ASC", Henkilo.class)
                .getResultList();
        when(vtjClient.fetchHenkilo(eq("111111-1234"))).thenReturn(mockVtjClient.fetchHenkilo("010101-123N"));
        when(vtjClient.fetchHenkilo(not(eq("111111-1234")))).thenThrow(new IllegalArgumentException("Ei pitäisi tapahtua"));

        identificationService.identifyHenkilos(yksiloimattomat, 0L);

        assertThat(yksiloimattomat).allSatisfy(henkilo -> {
            Optional<Yksilointivirhe> yksilointivirhe = yksilointivirheRepository.findByHenkilo(henkilo);
            assertThat(yksilointivirhe)
                    .withFailMessage("Henkilöllä '%s' ei pitäisi olla yksilöintivirhettä: %s",
                            henkilo.getOidHenkilo(), yksilointivirhe.map(Yksilointivirhe::getViesti))
                    .isNotPresent();
        });
        assertPublished(objectMapper, snsClient, 2, yksiloimattomat.stream().map(h -> h.getOidHenkilo()).toArray(String[]::new));
    }
}
