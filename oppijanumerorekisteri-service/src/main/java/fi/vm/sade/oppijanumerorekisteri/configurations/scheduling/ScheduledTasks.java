package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.MuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Ajastusten konfigurointi.
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final OppijanumerorekisteriProperties properties;

    private final IdentificationService identificationService;

    private final HenkiloRepository henkiloRepository;

    private final MuutostietoClient muutostietoClient;

    @Scheduled(fixedDelayString = "${oppijanumerorekisteri.scheduling.yksilointi.fixed-delay-in-millis}")
    public void startYksilointiTask() {
        if (properties.getScheduling().getYksilointi().getEnabled()) {
            log.info("Identification started...");
            long start = System.currentTimeMillis();
            OppijanumerorekisteriProperties.Scheduling.Yksilointi yksilointiProperties = properties.getScheduling().getYksilointi();

            Long offset = 0L;
            Collection<Henkilo> unidentifiedHenkilos = henkiloRepository.findUnidentified(yksilointiProperties.getBatchSize(), offset);
            while (!unidentifiedHenkilos.isEmpty()) {
                identificationService.identifyHenkilos(unidentifiedHenkilos, yksilointiProperties.getVtjRequestDelayInMillis());
                offset += yksilointiProperties.getBatchSize();
                unidentifiedHenkilos = henkiloRepository.findUnidentified(yksilointiProperties.getBatchSize(), offset);
            }

            long duration = System.currentTimeMillis() - start;
            log.info("Identification completed, duration: " + duration + "ms");
        }

    }

    @Scheduled(fixedDelayString = "${oppijanumerorekisteri.scheduling.vtjsync.fixed-delay-in-millis}")
    @Transactional
    public void startHetuSync() {
        if (properties.getScheduling().getVtjsync().getEnabled()) {
            log.info("Started syncing hetus to VTJ...");
            long start = System.currentTimeMillis();

            List<Henkilo> henkilosToAdd = henkiloRepository
                    .findTop5000ByHetuIsNotNullAndPassivoituIsFalseAndVtjRegisterIsFalseAndYksiloityVTJIsTrue();

            MuutostietoHetus hetus = MuutostietoHetus.builder()
                    .addedHetus(henkilosToAdd.stream()
                            .map(Henkilo::getHetu)
                            .collect(Collectors.toList()))
                    .removedHetus(Lists.newArrayList())
                    .build();
            this.muutostietoClient.sendHetus(hetus);

            henkilosToAdd.forEach(henkilo -> henkilo.setVtjRegister(true));

            long duration = System.currentTimeMillis() - start;
            log.info("Hetu sync completed, duration: " + duration + "ms");
        }
    }
}
