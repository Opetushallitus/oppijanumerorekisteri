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
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {CleanupService.class, NOPStep.class, OppijanumerorekisteriProperties.class})
class CleanupServiceTest {

    @Mock
    Appender<ILoggingEvent> mockAppender;

    @MockBean
    HenkiloRepository henkiloRepository;

    @Autowired
    CleanupService cleanupService;

    @Mock
    Henkilo subject;

    @Test
    void runNoSubject() {
        given(henkiloRepository.findDeadWithIncompleteCleanup(CleanupStep.INITIATED)).willReturn(Collections.emptyList());

        cleanupService.run();

        verifyNoInteractions(subject);
    }

    @Test
    void runNullSubject() {
        given(henkiloRepository.findDeadWithIncompleteCleanup(CleanupStep.INITIATED)).willReturn(List.of(subject));

        cleanupService.run();

        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }

    @Test
    void runInitiatedSubject() {
        given(subject.getCleanupStep()).willReturn(CleanupStep.INITIATED);
        given(henkiloRepository.findDeadWithIncompleteCleanup(CleanupStep.INITIATED)).willReturn(List.of(subject));

        cleanupService.run();

        verify(subject, never()).setCleanupStep(any());
    }

    @Test
    void applyStepNoSubject() {
        cleanupService.applyStep(Collections.emptyList(), CleanupStep.INITIATED);

        verifyNoInteractions(subject);
    }

    @Test
    void applyStepNullSubject() {
        cleanupService.applyStep(List.of(subject), CleanupStep.INITIATED);

        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }

    @Test
    void applyStepInitiatedSubject() {
        given(subject.getCleanupStep()).willReturn(CleanupStep.INITIATED);

        cleanupService.applyStep(List.of(subject), CleanupStep.INITIATED);

        verify(subject, never()).setCleanupStep(any());
    }

    @Test
    void reportEmpty() {
        cleanupService.report(Collections.emptyMap(), CleanupStep.INITIATED);

        verifyNoInteractions(mockAppender);
    }

    @Test
    void reportSuccess() {
        Logger logger = (Logger) LoggerFactory.getLogger(CleanupService.class);
        logger.addAppender(mockAppender);

        cleanupService.report(Map.of(true, 1), CleanupStep.INITIATED);

        verify(mockAppender, times(1)).doAppend(ArgumentMatchers.argThat(msg -> {
            assertThat(msg.getLevel()).isEqualTo(Level.INFO);
            return true;
        }));
    }

    @Test
    void reportFailure() {
        ArgumentCaptor<ILoggingEvent> argumentCaptor = ArgumentCaptor.forClass(ILoggingEvent.class);
        Logger logger = (Logger) LoggerFactory.getLogger(CleanupService.class);
        logger.addAppender(mockAppender);

        cleanupService.report(Map.of(false, 1), CleanupStep.INITIATED);

        verify(mockAppender, times(2)).doAppend(argumentCaptor.capture());
        assertThat(argumentCaptor.getAllValues().get(0).getLevel()).isEqualTo(Level.INFO);
        assertThat(argumentCaptor.getAllValues().get(1).getLevel()).isEqualTo(Level.ERROR);
    }

    @Test
    void resolveSubjectsNeedingStepNoSubject() {
        assertThat(cleanupService.resolveSubjectsNeedingStep(Collections.emptyList(), CleanupStep.INITIATED)).isEmpty();
    }

    @Test
    void resolveSubjectsNeedingStepNullSubject() {
        assertThat(cleanupService.resolveSubjectsNeedingStep(List.of(subject), CleanupStep.INITIATED)).hasSize(1);
    }

    @Test
    void resolveSubjectsNeedingStepInitiatedSubject() {
        given(subject.getCleanupStep()).willReturn(CleanupStep.INITIATED);

        assertThat(cleanupService.resolveSubjectsNeedingStep(Collections.emptyList(), CleanupStep.INITIATED)).isEmpty();
    }
}
