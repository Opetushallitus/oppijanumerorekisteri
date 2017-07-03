package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.TestApplication;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.HibernateConfiguration;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = {TestApplication.class, H2Configuration.class})
//@Import(IdentificationServiceImpl.class)
@Transactional
public class IdentificationServiceIntegrationTest {
    @MockBean
    private HenkiloJpaRepository henkiloJpaRepository;
    @MockBean
    private HenkiloRepository henkiloRepository;
    @MockBean
    private UserDetailsHelper userDetailsHelper;
    @MockBean
    private OrikaConfiguration mapper;
    @MockBean
    private YksilointiService yksilointiService;

    @Autowired
    private IdentificationServiceImpl identificationService;

    @Autowired
    private EntityManager entityManager;

//    @Before
//    public void setup() {
//        identificationService = new IdentificationServiceImpl(henkiloRepository, henkiloJpaRepository,
//                userDetailsHelper, mapper, yksilointiService);
//    }

    @Test
    public void identifyHenkilos() {
        Henkilo henkiloWithFakeSSN = Henkilo.builder()
                .hetu("111111-985K")
                .oidHenkilo("FakeSSN")
                .build();
//        this.entityManager.persist(henkiloWithFakeSSN);

        Henkilo henkiloInBlacklist = Henkilo.builder()
                .hetu("111111-1234")
                .oidHenkilo("Blacklisted")
                .eiYksiloida(true)
                .build();
//        this.entityManager.persist(henkiloInBlacklist);

        Henkilo henkiloNotFoundInVTJ = Henkilo.builder()
                .hetu("111111-1234")
                .oidHenkilo("NotInVTJ")
                .build();
//        this.entityManager.persist(henkiloNotFoundInVTJ);

        Henkilo henkiloEverythingOK = Henkilo.builder()
                .hetu("111111-1234")
                .oidHenkilo("EverythingOK")
                .yksiloityVTJ(true)
                .build();
//        this.entityManager.persist(henkiloEverythingOK);

        List<Henkilo> unidentifiedHenkilos = Arrays.asList(henkiloWithFakeSSN, henkiloInBlacklist, henkiloNotFoundInVTJ, henkiloEverythingOK);

//        when(henkiloRepository.save(any(Henkilo.class))).then(AdditionalAnswers.returnsFirstArg());
        when(yksilointiService.yksiloiManuaalisesti(henkiloNotFoundInVTJ.getOidHenkilo())).thenThrow(new NotFoundException());
        when(yksilointiService.yksiloiManuaalisesti(henkiloEverythingOK.getOidHenkilo())).thenReturn(henkiloEverythingOK);

        identificationService.identifyHenkilos(unidentifiedHenkilos, 0L);

//        assertThat(identifiedHenkilos).hasSize(2).contains(henkiloEverythingOK, henkiloNotFoundInVTJ);
        assertThat(henkiloEverythingOK.isYksiloityVTJ()).isTrue();
        assertThat(henkiloNotFoundInVTJ.isYksiloityVTJ()).isFalse();
    }

}
