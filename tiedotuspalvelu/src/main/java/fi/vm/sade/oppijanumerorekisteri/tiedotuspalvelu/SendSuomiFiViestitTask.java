package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@AllArgsConstructor
public class SendSuomiFiViestitTask {

  private static final int _24_HOURS_IN_MINUTES = 60 * 24;
  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestiRepository suomiFiViestiRepository;
  private final SuomiFiViestitService suomiFiViestitService;

  @Transactional
  public void execute() {
    log.info("Running SendSuomiFiViestitTask");
    var unprocessed = suomiFiViestiRepository.findUnprocessed();
    for (var viesti : unprocessed) {
      try {
        Tiedote tiedote =
            tiedoteRepository
                .findById(viesti.getTiedoteId())
                .orElseThrow(
                    () ->
                        new IllegalStateException(
                            "Tiedote not found for SuomiFiViesti " + viesti.getId()));
        var messageId = suomiFiViestitService.sendSuomiFiViesti(tiedote, viesti);
        viesti.setMessageId(messageId);
        viesti.setProcessedAt(OffsetDateTime.now());
        viesti.setNextRetry(null);
        viesti.setRetryCount(0);
        suomiFiViestiRepository.save(viesti);
      } catch (Exception e) {
        log.error("Failed to send SuomiFiViesti {}", viesti.getId(), e);
        viesti.setRetryCount(viesti.getRetryCount() + 1);
        long delayInMinutes =
            (long) Math.min(Math.pow(2, viesti.getRetryCount() - 1), _24_HOURS_IN_MINUTES);
        viesti.setNextRetry(OffsetDateTime.now().plusMinutes(delayInMinutes));
        suomiFiViestiRepository.save(viesti);
      }
    }
    log.info("Finished running SendSuomiFiViestitTask");
  }
}
