package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.mockito.Mockito.*;

class OppijaTuontiAsyncServiceImplTest {

    private static final long batchId = 1L;

    OppijaTuontiService service;
    OppijaTuontiAsyncServiceImpl batchJob;

    @BeforeEach
    void setUp() {
        service = mock(OppijaTuontiService.class);
        batchJob = new OppijaTuontiAsyncServiceImpl(service);
    }

    @Test
    void handleBatchInOneGo() {
        when(service.create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO)).thenReturn(true);

        batchJob.create(batchId);

        verify(service, times(1)).create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO);
    }

    @Test
    void handleBatchInMultipleParts() {
        when(service.create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO))
                .thenReturn(false)
                .thenReturn(true);

        batchJob.create(batchId);

        verify(service, times(2)).create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO);
    }

    @Test
    void retryFailedBatch() {
        when(service.create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO))
                .thenThrow(ObjectOptimisticLockingFailureException.class)
                .thenReturn(true);

        batchJob.create(batchId);

        verify(service, times(2)).create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO);
    }

    @Test
    void resetsRetryCounterOnFailure() {
        when(service.create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO))
                .thenThrow(ObjectOptimisticLockingFailureException.class)
                .thenReturn(false)
                .thenThrow(ObjectOptimisticLockingFailureException.class);

        batchJob.create(batchId);

        verify(service, times(OppijaTuontiAsyncServiceImpl.MAX_RETRIES + 2)).create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO);
    }

    @Test
    void stopAfterRetryLimit() {
        when(service.create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO))
                .thenThrow(ObjectOptimisticLockingFailureException.class);

        batchJob.create(batchId);

        verify(service, times(OppijaTuontiAsyncServiceImpl.MAX_RETRIES)).create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO);
    }

    @Test
    void stopOnUnexpectedErrors() {
        when(service.create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO))
                .thenThrow(RuntimeException.class);

        batchJob.create(batchId);

        verify(service, times(1)).create(batchId, OppijaTuontiAsyncServiceImpl.ERAKOKO);
    }
}
