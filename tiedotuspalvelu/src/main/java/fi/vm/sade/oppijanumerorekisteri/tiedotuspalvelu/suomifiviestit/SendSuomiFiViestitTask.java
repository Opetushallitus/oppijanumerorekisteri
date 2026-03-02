package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@Slf4j
@AllArgsConstructor
public class SendSuomiFiViestitTask {

  private static final int _24_HOURS_IN_MINUTES = 60 * 24;
  private final SuomiFiViestiRepository suomiFiViestiRepository;
  private final SuomiFiViestitService suomiFiViestitService;
  private final TransactionTemplate transactionTemplate;

  public void execute() {
    log.info("Running SendSuomiFiViestitTask");
    var unprocessed = suomiFiViestiRepository.findUnprocessed();
    for (var viesti : unprocessed) {
      try {
        transactionTemplate.executeWithoutResult(
            status -> {
              var messageId = suomiFiViestitService.sendSuomiFiViesti(viesti);
              viesti.setMessageId(messageId);
              viesti.setProcessedAt(OffsetDateTime.now());
              viesti.setNextRetry(null);
              viesti.setRetryCount(0);
              suomiFiViestiRepository.save(viesti);
            });
      } catch (Exception e) {
        log.error("Failed to send SuomiFiViesti {}", viesti.getId(), e);
        transactionTemplate.executeWithoutResult(
            status -> {
              var v = suomiFiViestiRepository.findById(viesti.getId()).orElse(viesti);
              v.setRetryCount(v.getRetryCount() + 1);
              long delayInMinutes =
                  (long) Math.min(Math.pow(2, v.getRetryCount() - 1), _24_HOURS_IN_MINUTES);
              v.setNextRetry(OffsetDateTime.now().plusMinutes(delayInMinutes));
              suomiFiViestiRepository.save(v);
            });
      }
    }
    log.info("Finished running SendSuomiFiViestitTask");
  }
}
