package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@AllArgsConstructor
public class FetchLocalisationsTask {

  private final LokalisointiClient lokalisointiClient;
  private final LocalisationRepository localisationRepository;

  @Transactional
  public void execute() {
    log.info("Running FetchLocalisationsTask");
    var entries = lokalisointiClient.getLocalisations();
    var localisations =
        entries.stream()
            .map(
                e ->
                    Localisation.builder()
                        .key(e.key())
                        .locale(e.locale())
                        .value(e.value())
                        .updated(OffsetDateTime.now())
                        .build())
            .toList();
    localisationRepository.deleteAll();
    localisationRepository.saveAll(localisations);
    log.info("Fetched {} localisations", localisations.size());
  }
}
