package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@AllArgsConstructor
public class FetchOppijaTask {

  public static final int _24_HOURS_IN_MINUTES = 60 * 24;
  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestiRepository suomiFiViestiRepository;
  private final OppijanumerorekisteriClient oppijanumerorekisteriClient;

  @Transactional
  public void execute() {
    log.info("Running FetchOppijaTask");
    var unprocessed = tiedoteRepository.findUnprocessed();
    for (var tiedote : unprocessed) {
      try {
        var hetu = oppijanumerorekisteriClient.getHenkilotieto(tiedote.getOppijanumero()).hetu();
        var viesti = SuomiFiViesti.builder().tiedoteId(tiedote.getId()).henkilotunnus(hetu).build();
        suomiFiViestiRepository.save(viesti);
        tiedote.setProcessedAt(OffsetDateTime.now());
        tiedote.setNextRetry(null);
        tiedote.setRetryCount(0);
        tiedoteRepository.save(tiedote);
      } catch (Exception e) {
        log.error("Failed to fetch henkilotunnus for tiedote {}", tiedote.getId(), e);
        tiedote.setRetryCount(tiedote.getRetryCount() + 1);
        long delayInMinutes =
            (long) Math.min(Math.pow(2, tiedote.getRetryCount() - 1), _24_HOURS_IN_MINUTES);
        tiedote.setNextRetry(OffsetDateTime.now().plusMinutes(delayInMinutes));
        tiedoteRepository.save(tiedote);
      }
    }
    log.info("Finished running FetchOppijaTask");
  }
}
