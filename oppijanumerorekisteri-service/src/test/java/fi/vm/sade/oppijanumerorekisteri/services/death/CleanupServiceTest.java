package fi.vm.sade.oppijanumerorekisteri.services.death;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.Appender;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.death.steps.NOPStep;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {CleanupService.class, NOPStep.class, OppijanumerorekisteriProperties.class})
class CleanupServiceTest {

    @Mock
    Appender<ILoggingEvent> mockAppender;

    @MockitoBean
    HenkiloRepository henkiloRepository;

    @Autowired
    CleanupService cleanupService;

    @Mock
    Henkilo subject;

    @BeforeEach
    void setUp() {
        Logger logger = (Logger) LoggerFactory.getLogger(CleanupService.class);
        logger.addAppender(mockAppender);
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(subject));
    }

    @Test
    void runNoSubject() {
        given(henkiloRepository.findDeadWithIncompleteCleanup(any(CleanupStep.class))).willReturn(Collections.emptyList());

        cleanupService.run();

        verifyNoInteractions(subject);
    }

    @Test
    void runNullSubject() {
        given(henkiloRepository.findDeadWithIncompleteCleanup(any(CleanupStep.class))).willReturn(List.of(subject));

        cleanupService.run();

        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }

    @Test
    void runInitiatedSubject() {
        given(subject.getCleanupStep()).willReturn(CleanupStep.INITIATED);
        given(henkiloRepository.findDeadWithIncompleteCleanup(any(CleanupStep.class))).willReturn(List.of(subject));

        cleanupService.run();

        verify(subject, never()).setCleanupStep(any());
    }

    @Test
    void applyStepNoSubject() {
        cleanupService.applyStep(CleanupStep.INITIATED);

        verifyNoInteractions(subject);
    }

    @Test
    void applyStepNullSubject() {
        given(henkiloRepository.findByOidHenkilo(any())).willReturn(Optional.of(subject));
        given(henkiloRepository.findDeadWithIncompleteCleanup(any(CleanupStep.class))).willReturn(List.of(subject));

        cleanupService.applyStep(CleanupStep.INITIATED);

        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }

    @Test
    void applyStepInitiatedSubject() {
        given(subject.getCleanupStep()).willReturn(CleanupStep.INITIATED);

        cleanupService.applyStep(CleanupStep.INITIATED);

        verify(subject, never()).setCleanupStep(any());
    }

    @Test
    void reportEmpty() {
        cleanupService.output(Collections.emptyMap(), CleanupStep.INITIATED);

        verifyNoInteractions(mockAppender);
    }

    @Test
    void reportSuccess() {
        ArgumentCaptor<ILoggingEvent> argumentCaptor = ArgumentCaptor.forClass(ILoggingEvent.class);

        cleanupService.output(Map.of(true, 1), CleanupStep.INITIATED);

        verify(mockAppender, times(1)).doAppend(argumentCaptor.capture());
        assertThat(argumentCaptor.getAllValues().get(0).getLevel()).isEqualTo(Level.INFO);
    }

    @Test
    void reportFailure() {
        ArgumentCaptor<ILoggingEvent> argumentCaptor = ArgumentCaptor.forClass(ILoggingEvent.class);

        cleanupService.output(Map.of(false, 1), CleanupStep.INITIATED);

        verify(mockAppender, times(2)).doAppend(argumentCaptor.capture());
        assertThat(argumentCaptor.getAllValues().get(0).getLevel()).isEqualTo(Level.INFO);
        assertThat(argumentCaptor.getAllValues().get(1).getLevel()).isEqualTo(Level.ERROR);
    }
}
