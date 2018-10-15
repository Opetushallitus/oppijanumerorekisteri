package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.configurations.AsyncConfiguration;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiAsyncService;
import org.springframework.transaction.annotation.Propagation;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaTuontiAsyncServiceImpl implements OppijaTuontiAsyncService {

    // määrittää kuinka monta riviä käsitellään yhdessä transaktiossa
    private static final int ERAKOKO = 1000;

    private final OppijaTuontiService oppijaTuontiService;

    @Override
    @Transactional(propagation = Propagation.NEVER)
    @Async(AsyncConfiguration.OPPIJOIDEN_TUONTI_EXECUTOR_QUALIFIER)
    public void create(long id) {
        // luodaan henkilöt kantaan pienemmissä transaktioissa
        while (!oppijaTuontiService.create(id, ERAKOKO)) {
            // nop
        }
    }

}
