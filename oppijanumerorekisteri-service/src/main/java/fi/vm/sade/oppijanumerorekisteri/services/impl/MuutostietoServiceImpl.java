package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.MuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.AsiayhteysCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.MuutostietoService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@Service
@Transactional
@RequiredArgsConstructor
public class MuutostietoServiceImpl implements MuutostietoService {

    private static final Logger log = LoggerFactory.getLogger(MuutostietoServiceImpl.class);

    private static final long MUUTOSTIETOPALVELU_MAKSIMIRIVIMAARA = 5000L;

    private final OppijanumerorekisteriProperties properties;
    private final AsiayhteysRepository asiayhteysRepository;
    private final MuutostietoClient muutostietoClient;

    public void sendHetus() {
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
