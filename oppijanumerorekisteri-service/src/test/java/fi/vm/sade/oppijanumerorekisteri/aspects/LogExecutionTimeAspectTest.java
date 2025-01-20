package fi.vm.sade.oppijanumerorekisteri.aspects;

import nl.altindag.log.LogCaptor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LogExecutionTimeAspectTest {

    private final Object result = "TEST";
    private ProceedingJoinPoint proceedingJoinPoint;
    private LogExecutionTimeAspect aspect;
    private LogCaptor logCaptor;

    @BeforeEach
    void setUp() throws Throwable {

        proceedingJoinPoint = mock(ProceedingJoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);

        when(proceedingJoinPoint.getSignature()).thenReturn(signature);
        when(proceedingJoinPoint.proceed()).thenReturn(result);
        when(signature.getDeclaringType()).thenReturn(getClass());
        when(signature.getName()).thenReturn("testMethod");

        aspect = new LogExecutionTimeAspect();

        logCaptor = LogCaptor.forClass(LogExecutionTimeAspect.class);
        logCaptor.clearLogs();
        logCaptor.resetLogLevel();
    }

    @Test
    void writesToLogWhenLogLevelIsInfo() throws Throwable {
        logCaptor.setLogLevelToInfo();
        assertThat(aspect.methodTimeLogger(proceedingJoinPoint)).isEqualTo(result);
        assertThat(logCaptor.getInfoLogs()).hasSize(1);
        assertThat(logCaptor.getInfoLogs().get(0)).contains("took");
    }
}
