package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.eq;

@RunWith(SpringRunner.class)
@IntegrationTest
@Transactional
public class IdentificationServiceIntegrationTest {
    @MockBean
    private YksilointiService yksilointiService;

    @Autowired
    private IdentificationService identificationService;

    @Autowired
    private EntityManager entityManager;

    @Test
    public void identifyHenkilos() {
        Henkilo henkiloWithFakeSSN = Henkilo.builder()
                .hetu("111111-985K")
                .oidHenkilo("FakeSSN")
                .created(new Date())
                .modified(new Date())
                .henkiloTyyppi(HenkiloTyyppi.VIRKAILIJA)
                .build();
        this.entityManager.persist(henkiloWithFakeSSN);

        Henkilo henkiloInBlacklist = Henkilo.builder()
                .hetu("111111-1234")
                .oidHenkilo("Blacklisted")
                .created(new Date())
                .modified(new Date())
                .henkiloTyyppi(HenkiloTyyppi.VIRKAILIJA)
                .eiYksiloida(true)
                .build();
        this.entityManager.persist(henkiloInBlacklist);

        Henkilo henkiloNotFoundInVTJ = Henkilo.builder()
                .hetu("111111-1235")
                .oidHenkilo("NotInVTJ")
                .created(new Date())
                .modified(new Date())
                .henkiloTyyppi(HenkiloTyyppi.VIRKAILIJA)
                .build();
        this.entityManager.persist(henkiloNotFoundInVTJ);

        Henkilo henkiloEverythingOK = Henkilo.builder()
                .hetu("111111-1236")
                .oidHenkilo("EverythingOK")
                .created(new Date())
                .modified(new Date())
                .henkiloTyyppi(HenkiloTyyppi.VIRKAILIJA)
                .yksiloityVTJ(true)
                .build();
        this.entityManager.persist(henkiloEverythingOK);

        List<Henkilo> unidentifiedHenkilos = Arrays.asList(henkiloWithFakeSSN, henkiloInBlacklist, henkiloNotFoundInVTJ, henkiloEverythingOK);

//        when(henkiloRepository.save(any(Henkilo.class))).then(AdditionalAnswers.returnsFirstArg());
        given(yksilointiService.yksiloiAutomaattisesti(henkiloNotFoundInVTJ.getOidHenkilo()))
                .willReturn(Optional.empty());
        given(this.yksilointiService.yksiloiAutomaattisesti(eq(henkiloEverythingOK.getOidHenkilo())))
                .willReturn(Optional.of(henkiloEverythingOK));

        identificationService.identifyHenkilos(unidentifiedHenkilos, 0L);

//        assertThat(identifiedHenkilos).hasSize(2).contains(henkiloEverythingOK, henkiloNotFoundInVTJ);
        assertThat(henkiloEverythingOK.isYksiloityVTJ()).isTrue();
        assertThat(henkiloNotFoundInVTJ.isYksiloityVTJ()).isFalse();
    }

}
