package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.Appender;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.*;

class AbstractCleanupTaskTest {

    @Test
    void happyPath() {
        AbstractCleanupTask step = mock(
                AbstractCleanupTask.class,
                Mockito.CALLS_REAL_METHODS);
        step.properties = mock(OppijanumerorekisteriProperties.class);
        Henkilo subject = mock(Henkilo.class);
        given(step.getCleanupStep()).willReturn(CleanupStep.INITIATED);

        Assertions.assertTrue(step.applyTo(subject));

        verify(subject, times(1)).setCleanupStep(CleanupStep.INITIATED);
    }

    @Test
    void handlesExceptions() {
        Appender<ILoggingEvent> mockAppender = mock(Appender.class);
        Logger logger = (Logger) LoggerFactory.getLogger(AbstractCleanupTask.class);
        logger.addAppender(mockAppender);
        AbstractCleanupTask step = mock(
                AbstractCleanupTask.class,
                Mockito.CALLS_REAL_METHODS);
        Henkilo subject = mock(Henkilo.class);
        given(step.getCleanupStep()).willReturn(CleanupStep.INITIATED);
        willThrow(new RuntimeException())
                .given(step).apply(subject);

        Assertions.assertFalse(step.applyTo(subject));

        verify(mockAppender, times(1)).doAppend(ArgumentMatchers.argThat(msg -> {
            assertThat(msg.getLevel()).isEqualTo(Level.ERROR);
            return true;
        }));
    }
}
