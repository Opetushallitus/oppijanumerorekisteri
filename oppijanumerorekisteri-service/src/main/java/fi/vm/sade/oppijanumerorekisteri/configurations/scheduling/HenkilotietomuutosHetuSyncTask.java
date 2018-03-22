package fi.vm.sade.oppijanumerorekisteri.configurations.scheduling;

import com.github.kagkarlsson.scheduler.task.*;
import fi.vm.sade.oppijanumerorekisteri.clients.MuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.AsiayhteysCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import static java.util.stream.Collectors.toList;

/**
 *
 * @see SchedulingConfiguration ajastuksen aktivointi
 */
@Slf4j
@Component
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class HenkilotietomuutosHetuSyncTask extends RecurringTask {

    private static final long MUUTOSTIETOPALVELU_MAKSIMIRIVIMAARA = 5000L;

    private final OppijanumerorekisteriProperties properties;
    private final AsiayhteysRepository asiayhteysRepository;
    private final MuutostietoClient muutostietoClient;

    @Autowired
    public HenkilotietomuutosHetuSyncTask(OppijanumerorekisteriProperties properties,
                                          AsiayhteysRepository asiayhteysRepository,
                                          MuutostietoClient muutostietoClient) {
        super("henkilotietomuutos hetu sync task", FixedDelay.of(Duration.ofMillis(properties.getScheduling().getVtjsync().getFixedDelayInMillis())));
        this.properties = properties;
        this.asiayhteysRepository = asiayhteysRepository;
        this.muutostietoClient = muutostietoClient;
    }

    @Override
    @Transactional
    public void execute(TaskInstance<Void> taskInstance, ExecutionContext executionContext) {
        if (properties.getScheduling().getVtjsync().getEnabled()) {
            log.info("Started syncing hetus to VTJ...");
            long start = System.currentTimeMillis();

            AsiayhteysCriteria criteria = new AsiayhteysCriteria(LocalDate.now());
            boolean asiayhteysKaytossa = Boolean.TRUE.equals(properties.getScheduling().getVtjsync().getAsiayhteysKaytossa());
            criteria.setAsiayhteysKaytossa(asiayhteysKaytossa);
            List<Henkilo> poistettavat = asiayhteysKaytossa
                    ? asiayhteysRepository.findPoistettavat(criteria, MUUTOSTIETOPALVELU_MAKSIMIRIVIMAARA)
                    : Collections.emptyList();
            long lisattavatMax = MUUTOSTIETOPALVELU_MAKSIMIRIVIMAARA - poistettavat.size();
            List<Henkilo> henkilosToAdd = lisattavatMax > 0L
                    ? asiayhteysRepository.findLisattavat(criteria, lisattavatMax)
                    : Collections.emptyList();

            MuutostietoHetus hetus = MuutostietoHetus.builder()
                    .addedHetus(henkilosToAdd.stream()
                            .map(Henkilo::getHetu)
                            .collect(Collectors.toList()))
                    .removedHetus(poistettavat.stream()
                            .map(Henkilo::getHetu)
                            .collect(toList()))
                    .build();
            this.muutostietoClient.sendHetus(hetus);

            henkilosToAdd.forEach(henkilo -> henkilo.setVtjRegister(true));
            poistettavat.forEach(henkilo -> henkilo.setVtjRegister(false));

            long duration = System.currentTimeMillis() - start;
            log.info("Hetu sync completed, duration: " + duration + "ms");
        }

    }
}
