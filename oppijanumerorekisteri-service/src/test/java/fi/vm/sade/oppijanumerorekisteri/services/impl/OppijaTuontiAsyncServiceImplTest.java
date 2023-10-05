package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.TuontiApi;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.mockito.Mockito.*;

class OppijaTuontiAsyncServiceImplTest {

    private static final long BATCH_ID = 1L;
    private final TuontiApi api = TuontiApi.OPPIJA;

    OppijaTuontiService service;
    OppijaTuontiAsyncServiceImpl batchJob;

    @BeforeEach
    void setUp() {
        service = mock(OppijaTuontiService.class);
        batchJob = new OppijaTuontiAsyncServiceImpl(service);
    }

    @Test
    void handleBatchInOneGo() {
        when(service.create(BATCH_ID, api)).thenReturn(true);

        batchJob.create(BATCH_ID, api);

        verify(service, times(1)).create(BATCH_ID, api);
    }

    @Test
    void handleBatchInMultipleParts() {
        when(service.create(BATCH_ID, api))
                .thenReturn(false)
                .thenReturn(true);

        batchJob.create(BATCH_ID, api);

        verify(service, times(2)).create(BATCH_ID, api);
    }

    @Test
    void retryFailedBatch() {
        when(service.create(BATCH_ID, api))
                .thenThrow(ObjectOptimisticLockingFailureException.class)
                .thenReturn(true);

        batchJob.create(BATCH_ID, api);

        verify(service, times(2)).create(BATCH_ID, api);
    }

    @Test
    void resetsRetryCounterOnFailure() {
        when(service.create(BATCH_ID, api))
                .thenThrow(ObjectOptimisticLockingFailureException.class)
                .thenReturn(false)
                .thenThrow(ObjectOptimisticLockingFailureException.class);

        batchJob.create(BATCH_ID, api);

        verify(service, times(OppijaTuontiAsyncServiceImpl.MAX_RETRIES + 2)).create(BATCH_ID, api);
    }

    @Test
    void stopAfterRetryLimit() {
        when(service.create(BATCH_ID, api))
                .thenThrow(ObjectOptimisticLockingFailureException.class);

        batchJob.create(BATCH_ID, api);

        verify(service, times(OppijaTuontiAsyncServiceImpl.MAX_RETRIES)).create(BATCH_ID, api);
    }

    @Test
    void stopOnUnexpectedErrors() {
        when(service.create(BATCH_ID, api))
                .thenThrow(RuntimeException.class);

        batchJob.create(BATCH_ID, api);

        verify(service, times(1)).create(BATCH_ID, api);
    }
}
