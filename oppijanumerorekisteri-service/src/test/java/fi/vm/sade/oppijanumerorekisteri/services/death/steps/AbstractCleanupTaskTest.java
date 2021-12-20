package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.Appender;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.*;

class AbstractCleanupTaskTest {

    @Mock(answer = Answers.CALLS_REAL_METHODS)
    AbstractCleanupTask step;

    @Mock
    Henkilo subject = mock(Henkilo.class);

    @Mock
    Appender<ILoggingEvent> mockAppender;

    @Mock
    OppijanumerorekisteriProperties properties;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        step.properties = properties;
        given(step.getCleanupStep()).willReturn(CleanupStep.INITIATED);
        Logger logger = (Logger) LoggerFactory.getLogger(AbstractCleanupTask.class);
        logger.addAppender(mockAppender);
    }

    @Test
    void happyPath() {
        Assertions.assertTrue(step.applyTo(subject));

        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }

    @Test
    void handlesExceptions() {
        ArgumentCaptor<ILoggingEvent> argumentCaptor = ArgumentCaptor.forClass(ILoggingEvent.class);
        willThrow(new RuntimeException())
                .given(step).apply(subject);

        Assertions.assertFalse(step.applyTo(subject));

        verify(mockAppender, times(1)).doAppend(argumentCaptor.capture());
        assertThat(argumentCaptor.getAllValues().get(0).getLevel()).isEqualTo(Level.ERROR);
    }
}
