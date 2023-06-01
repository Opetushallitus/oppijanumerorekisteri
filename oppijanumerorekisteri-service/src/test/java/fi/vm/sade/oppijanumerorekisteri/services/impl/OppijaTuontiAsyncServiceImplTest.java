package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.mockito.Mockito.*;

class OppijaTuontiAsyncServiceImplTest {

    private static final long BATCH_ID = 1L;

    OppijaTuontiService service;
    OppijaTuontiAsyncServiceImpl batchJob;

    @BeforeEach
    void setUp() {
        service = mock(OppijaTuontiService.class);
        batchJob = new OppijaTuontiAsyncServiceImpl(service);
    }

    @Test
    void handleBatchInOneGo() {
        when(service.create(BATCH_ID)).thenReturn(true);

        batchJob.create(BATCH_ID);

        verify(service, times(1)).create(BATCH_ID);
    }

    @Test
    void handleBatchInMultipleParts() {
        when(service.create(BATCH_ID))
                .thenReturn(false)
                .thenReturn(true);

        batchJob.create(BATCH_ID);

        verify(service, times(2)).create(BATCH_ID);
    }

    @Test
    void retryFailedBatch() {
        when(service.create(BATCH_ID))
                .thenThrow(ObjectOptimisticLockingFailureException.class)
                .thenReturn(true);

        batchJob.create(BATCH_ID);

        verify(service, times(2)).create(BATCH_ID);
    }

    @Test
    void resetsRetryCounterOnFailure() {
        when(service.create(BATCH_ID))
                .thenThrow(ObjectOptimisticLockingFailureException.class)
                .thenReturn(false)
                .thenThrow(ObjectOptimisticLockingFailureException.class);

        batchJob.create(BATCH_ID);

        verify(service, times(OppijaTuontiAsyncServiceImpl.MAX_RETRIES + 2)).create(BATCH_ID);
    }

    @Test
    void stopAfterRetryLimit() {
        when(service.create(BATCH_ID))
                .thenThrow(ObjectOptimisticLockingFailureException.class);

        batchJob.create(BATCH_ID);

        verify(service, times(OppijaTuontiAsyncServiceImpl.MAX_RETRIES)).create(BATCH_ID);
    }

    @Test
    void stopOnUnexpectedErrors() {
        when(service.create(BATCH_ID))
                .thenThrow(RuntimeException.class);

        batchJob.create(BATCH_ID);

        verify(service, times(1)).create(BATCH_ID);
    }
}
