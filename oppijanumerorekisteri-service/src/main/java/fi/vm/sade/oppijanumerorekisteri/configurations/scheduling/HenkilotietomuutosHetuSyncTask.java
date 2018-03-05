package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.*;
import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.MuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

/**
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Slf4j
@Component
public class HenkilotietomuutosHetuSyncTask extends RecurringTask {
    private final OppijanumerorekisteriProperties properties;
    private final HenkiloRepository henkiloRepository;
    private final MuutostietoClient muutostietoClient;

    @Autowired
    public HenkilotietomuutosHetuSyncTask(OppijanumerorekisteriProperties properties,
                                          HenkiloRepository henkiloRepository,
                                          MuutostietoClient muutostietoClient) {
        super("henkilotietomuutos hetu sync task", FixedDelay.of(Duration.ofMillis(properties.getScheduling().getVtjsync().getFixedDelayInMillis())));
        this.properties = properties;
        this.henkiloRepository = henkiloRepository;
        this.muutostietoClient = muutostietoClient;
    }

    @Override
    public void execute(TaskInstance<Void> taskInstance, ExecutionContext executionContext) {
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
