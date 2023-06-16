package fi.vm.sade.oppijanumerorekisteri.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletionException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoKirjausavainRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoRepository;
import fi.vm.sade.oppijanumerorekisteri.services.VtjMuutostietoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class VtjMuutostietoServiceImpl implements VtjMuutostietoService {
    private final VtjMuutostietoKirjausavainRepository kirjausavainRepository;
    private final VtjMuutostietoRepository muutostietoRepository;
    private final VtjMuutostietoClient muutostietoClient;
    private final HenkiloRepository henkiloRepository;

    @Autowired
    private TransactionTemplate transaction;

    private VtjMuutostietoKirjausavain fetchNewKirjausavain(long id) {
        try {
            long avain = muutostietoClient.fetchMuutostietoKirjausavain();
            VtjMuutostietoKirjausavain kirjausavain = new VtjMuutostietoKirjausavain(id, avain, LocalDateTime.now());
            kirjausavainRepository.save(kirjausavain);
            return kirjausavain;
        } catch (InterruptedException ie) {
            log.error("interrupted fetching a new kirjausavain", ie);
            Thread.currentThread().interrupt();
            throw new CompletionException(ie);
        } catch (Exception e) {
            throw new CompletionException(e);
        }
    }

    public boolean fetchMuutostietoBatchForBucket(long bucketId, List<String> hetus) {
        try {
            VtjMuutostietoKirjausavain kirjausavain = kirjausavainRepository.findById(bucketId)
                    .orElseGet(() -> fetchNewKirjausavain(bucketId));
            log.info("using kirjausavain " + kirjausavain.getAvain() + " for bucket " + bucketId);
            VtjMuutostietoResponse response = muutostietoClient.fetchHenkiloMuutostieto(kirjausavain.getAvain(),
                    hetus);
            muutostietoRepository.saveAll(response.getMuutokset());
            kirjausavain.setAvain(response.getViimeisinKirjausavain());
            kirjausavain.setUpdatedAt(LocalDateTime.now());
            kirjausavainRepository.save(kirjausavain);
            return response.getAjanTasalla();
        } catch (InterruptedException ie) {
            log.error("interrupted while fetching muutostieto for bucket " + bucketId, ie);
            Thread.currentThread().interrupt();
            return true;
        } catch (Exception e) {
            log.error("exception while fetching muutostieto for bucket " + bucketId, e);
            return true;
        }
    }

    @Override
    public void fetchHenkiloMuutostieto() {
        for (long i = 0; i < 100; i++) {
            final long bucketId = i;
            log.info("fetching muutostieto for bucket " + bucketId);
            long start = System.currentTimeMillis();

            boolean ajanTasalla;
            List<String> hetus = henkiloRepository.findHetusInBucket(bucketId);
            log.info("bucket " + bucketId + " size is " + hetus.size());
            do {
                ajanTasalla = transaction.execute(status -> fetchMuutostietoBatchForBucket(bucketId, hetus));
            } while (!ajanTasalla);

            long duration = System.currentTimeMillis() - start;
            log.info("fetching muutostieto for bucket took " + duration + "ms");
        }
    }
}
