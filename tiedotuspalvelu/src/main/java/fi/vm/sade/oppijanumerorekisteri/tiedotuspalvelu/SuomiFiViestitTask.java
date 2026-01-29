package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@AllArgsConstructor
public class SuomiFiViestitTask {

  public static final int _24_HOURS_IN_MINUTES = 60 * 24;
  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestitService suomiFiViestitService;

  @Transactional
  public void execute() {
    log.info("Running SuomiFiViestiTask");
    var unprocessed = tiedoteRepository.findByProcessedAtIsNull();
    for (var tiedote : unprocessed) {
      try {
        suomiFiViestitService.sendSuomiFiViesti(tiedote);
        tiedote.setProcessedAt(OffsetDateTime.now());
        tiedote.setNextRetry(null);
        tiedote.setRetryCount(0);
        tiedoteRepository.save(tiedote);
      } catch (Exception e) {
        log.error("Failed to process tiedote {}", tiedote.getId(), e);
        tiedote.setRetryCount(tiedote.getRetryCount() + 1);
        long delayInMinutes =
            (long) Math.min(Math.pow(2, tiedote.getRetryCount() - 1), _24_HOURS_IN_MINUTES);
        tiedote.setNextRetry(OffsetDateTime.now().plusMinutes(delayInMinutes));
        tiedoteRepository.save(tiedote);
      }
    }
    log.info("Finnished running SuomiFiViestiTask");
  }
}
