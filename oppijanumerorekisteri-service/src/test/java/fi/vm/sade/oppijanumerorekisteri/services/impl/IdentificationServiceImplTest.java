package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointivirhe;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointitietoRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointivirheRepository;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;

@RunWith(SpringRunner.class)
public class IdentificationServiceImplTest {
    @InjectMocks
    private IdentificationServiceImpl identificationService;

    @Mock
    private YksilointitietoRepository yksilointitietoRepository;

    @Mock
    private YksilointivirheRepository yksilointivirheRepository;

    @Mock
    private YksilointiService yksilointiService;

    @Test
    public void retriableYksilointivirheIsRespected() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("nonfakehetu")
                .build();
        LocalDateTime localDateTime = LocalDateTime.now().minusDays(1);
        Yksilointivirhe yksilointivirhe = Yksilointivirhe.builder()
                .uudelleenyritysMaara(0)
                .uudelleenyritysAikaleima(Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant()))
                .build();

        given(this.yksilointivirheRepository.findByHenkilo(henkilo)).willReturn(Optional.of(yksilointivirhe));
        this.identificationService.identifyHenkilos(Collections.singleton(henkilo), 1L);

        verify(this.yksilointiService, times(1)).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
    }

    @Test
    public void noYksilointivirheIsRespected() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("nonfakehetu")
                .build();
        given(this.yksilointivirheRepository.findByHenkilo(henkilo)).willReturn(Optional.empty());
        this.identificationService.identifyHenkilos(Collections.singleton(henkilo), 1L);

        verify(this.yksilointiService, times(1)).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
    }

    @Test
    public void fakeHetuPassedToYksilointiService() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("fakehet9")
                .build();
        given(this.yksilointivirheRepository.findByHenkilo(henkilo)).willReturn(Optional.empty());
        willThrow(SuspendableIdentificationException.class).given(this.yksilointiService).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
        this.identificationService.identifyHenkilos(Collections.singleton(henkilo), 1L);
        verify(this.yksilointiService, times(1)).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
        verify(this.yksilointiService, times(1)).tallennaYksilointivirhe(eq("1.2.3.4.5"), any());
    }
}
