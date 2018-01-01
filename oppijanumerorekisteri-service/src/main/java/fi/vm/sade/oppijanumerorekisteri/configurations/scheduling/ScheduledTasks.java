package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import fi.vm.sade.oppijanumerorekisteri.clients.MuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Ajastusten konfigurointi.
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private OppijanumerorekisteriProperties.Scheduling.Yksilointi properties;

    private final IdentificationService identificationService;

    private final HenkiloJpaRepository henkiloJpaRepository;

    private final HenkiloRepository henkiloRepository;

    private final MuutostietoClient muutostietoClient;

    @Autowired
    public void setProperties(OppijanumerorekisteriProperties properties) {
        this.properties = properties.getScheduling().getYksilointi();
    }

    @Scheduled(fixedDelayString = "${oppijanumerorekisteri.scheduling.yksilointi.fixed-delay-in-millis}")
    public void startYksilointiTask() {
        if (properties.getEnabled()) {
            log.info("Identification started...");
            long start = System.currentTimeMillis();

            Long offset = 0L;
            Collection<Henkilo> unidentifiedHenkilos = henkiloJpaRepository.findUnidentified(properties.getBatchSize(), offset);
            while (!unidentifiedHenkilos.isEmpty()) {
                identificationService.identifyHenkilos(unidentifiedHenkilos, properties.getVtjRequestDelayInMillis());
                offset += properties.getBatchSize();
                unidentifiedHenkilos = henkiloJpaRepository.findUnidentified(properties.getBatchSize(), offset);
            }

            long duration = System.currentTimeMillis() - start;
            log.info("Identification completed, duration: " + duration + "ms");
        }

    }

    @Scheduled(fixedDelayString = "${oppijanumerorekisteri.scheduling.vtjsync.fixed-delay-in-millis}")
    public void startHetuSync() {
        if (properties.getEnabled()) {
            log.info("Started syncing hetus to VTJ...");
            long start = System.currentTimeMillis();

            List<String> addedHetus = henkiloJpaRepository.findHetusMissingFromVTJRegister();
            List<String> removedHetus = new ArrayList<>();

            MuutostietoHetus hetus = MuutostietoHetus.builder()
                    .addedHetus(addedHetus)
                    .removedHetus(removedHetus)
                    .build();
            List<String> syncedHetus = muutostietoClient.sendHetus(hetus);

            for (String hetu : syncedHetus) {
                henkiloJpaRepository.addHetuToVTJRegister(hetu);
            }

            long duration = System.currentTimeMillis() - start;
            log.info("Hetu sync completed, duration: " + duration + "ms");
        }
    }
}
