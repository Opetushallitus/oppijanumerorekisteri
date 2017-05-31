package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.AdditionalAnswers;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(MockitoJUnitRunner.class)
public class IdentificationServiceImplTest {

    private IdentificationService impl;

    @Mock private HenkiloJpaRepository henkiloJpaRepository;
    @Mock private HenkiloRepository henkiloRepository;
    @Mock private UserDetailsHelper userDetailsHelper;
    @Mock private OrikaConfiguration mapper;
    @Mock private YksilointiService yksilointiService;

    @Before
    public void setup() {
        impl = new IdentificationServiceImpl(henkiloRepository, henkiloJpaRepository,
                userDetailsHelper, mapper, yksilointiService);
    }

    @Test
    public void identifyHenkilos() {
        Henkilo henkiloWithFakeSSN = Henkilo.builder()
                .hetu("111111-985K")
                .oidHenkilo("FakeSSN")
                .build();
        Henkilo henkiloInBlacklist = Henkilo.builder()
                .hetu("111111-1234")
                .oidHenkilo("Blacklisted")
                .eiYksiloida(true)
                .build();
        Henkilo henkiloNotFoundInVTJ = Henkilo.builder()
                .hetu("111111-1234")
                .oidHenkilo("NotInVTJ")
                .build();
        Henkilo henkiloEverythingOK = Henkilo.builder()
                .hetu("111111-1234")
                .oidHenkilo("EverythingOK")
                .yksiloityVTJ(true)
                .build();

        List<Henkilo> unidentifiedHenkilos = Arrays.asList(henkiloWithFakeSSN, henkiloInBlacklist, henkiloNotFoundInVTJ, henkiloEverythingOK);

        when(henkiloRepository.save(any(Henkilo.class))).then(AdditionalAnswers.returnsFirstArg());
        when(yksilointiService.yksiloiManuaalisesti(henkiloNotFoundInVTJ)).thenThrow(new NotFoundException());
        when(yksilointiService.yksiloiManuaalisesti(henkiloEverythingOK)).thenReturn(henkiloEverythingOK);

        Collection<Henkilo> identifiedHenkilos = impl.identifyHenkilos(unidentifiedHenkilos, 0L);

        assertThat(identifiedHenkilos).hasSize(2).contains(henkiloEverythingOK, henkiloNotFoundInVTJ);
        assertThat(henkiloEverythingOK.isYksiloityVTJ()).isTrue();
        assertThat(henkiloNotFoundInVTJ.isYksiloityVTJ()).isFalse();
    }

}
