package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.configurations.AsyncConfiguration;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiAsyncService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OppijaTuontiAsyncServiceImpl implements OppijaTuontiAsyncService {

    protected static final int MAX_RETRIES = 5;

    private final OppijaTuontiService oppijaTuontiService;

    @Override
    @Transactional(propagation = Propagation.NEVER)
    @Async(AsyncConfiguration.OPPIJOIDEN_TUONTI_EXECUTOR_QUALIFIER)
    public void create(long id) {

        int part = 1;
        int retry = 0;

        log.info("Batch: {}. Start batch job.", id);

        while (retry++ < MAX_RETRIES) {
            try {
                log.info("Batch: {} / Part: {} / Try: {}", id, part, retry);
                if (oppijaTuontiService.create(id)) {
                    break;
                }
                part++;
                retry = 0;
            } catch (ObjectOptimisticLockingFailureException optimisticLockingException) {
                log.info("Batch: {}. Expected failure, retrying.", id, optimisticLockingException);
            } catch (Exception e) {
                log.error("Batch: {}. Unexpected failure. Stopping execution.", id, e);
                retry = MAX_RETRIES;
            }
        }
    }
}
