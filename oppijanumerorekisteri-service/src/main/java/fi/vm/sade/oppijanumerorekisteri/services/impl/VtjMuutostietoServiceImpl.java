package fi.vm.sade.oppijanumerorekisteri.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;

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

    protected VtjMuutostietoKirjausavain fetchNewKirjausavain(long id) {
        try {
            long avain = muutostietoClient.fetchMuutostietoKirjausavain();
            VtjMuutostietoKirjausavain kirjausavain = new VtjMuutostietoKirjausavain(id, avain, LocalDateTime.now());
            kirjausavainRepository.save(kirjausavain);
            return kirjausavain;
        } catch (Exception e) {
            throw new CompletionException(e);
        }
    }

    @Transactional
    protected boolean fetchMuutostietoBatchForBucket(long bucketId, List<String> hetus)
            throws JsonProcessingException, InterruptedException, ExecutionException {
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
    }

    @Override
    public void fetchHenkiloMuutostieto() {
        for (long i = 0; i < 100; i++) {
            final long bucketId = i;
            try {
                log.info("fetching muutostieto for bucket " + bucketId);
                long start = System.currentTimeMillis();

                boolean ajanTasalla;
                List<String> hetus = henkiloRepository.findHetusInBucket(bucketId);
                log.info("bucket " + bucketId + " size is " + hetus.size());
                do {
                    ajanTasalla = fetchMuutostietoBatchForBucket(bucketId, hetus);
                } while (!ajanTasalla);

                long duration = System.currentTimeMillis() - start;
                log.info("fetching muutostieto for bucket took " + duration + "ms");
            } catch (Exception e) {
                log.error("failed to fetch muutostieto for bucket " + bucketId, e);
            }
        }
    }

}
