package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale.LocalisationRepository;
import java.time.OffsetDateTime;
import java.util.List;
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
  private final SuomiFiViestitClient suomiFiViestitClient;
  private final TiedotuspalveluProperties tiedotuspalveluProperties;
  private final LocalisationRepository localisationRepository;
  private final TransactionTemplate transactionTemplate;

  public void execute() {
    log.info("Running SendSuomiFiViestitTask");
    var unprocessed = suomiFiViestiRepository.findUnprocessed();
    for (var viesti : unprocessed) {
      try {
        transactionTemplate.executeWithoutResult(
            status -> {
              var messageId = sendSuomiFiViesti(viesti);
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

  private String sendSuomiFiViesti(SuomiFiViesti suomiFiViesti) {
    var title = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_OTSIKKO", "fi");
    var body = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_VIESTI", "fi");
    var request =
        new ElectronicMessageRequest(
            new ElectronicPart(
                List.of(),
                body,
                "Text",
                "Normal",
                new MessageNotifications(
                    new UnreadMessageNotification("Default reminder"),
                    "Organisation and service name"),
                "No one",
                title,
                "Normal"),
            suomiFiViesti.getTiedoteId().toString(),
            new Recipient(suomiFiViesti.getHenkilotunnus()),
            new Sender(tiedotuspalveluProperties.suomifiViestit().senderServiceId()));
    var messageId = suomiFiViestitClient.sendElectronicMessage(request);
    log.info("Sent Suomi.fi viesti for tiedote {}", suomiFiViesti.getTiedoteId());
    return messageId;
  }
}
