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
      } catch (MailboxNotInUseException e) {
        log.info("SuomiFiViesti {} mailbox not in use, switching to paper mail", viesti.getId());
        transactionTemplate.executeWithoutResult(
            status -> {
              viesti.setMessageType("paperMail");
              viesti.setRetryCount(0);
              viesti.setNextRetry(null);
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
    return switch (suomiFiViesti.getMessageType()) {
      case "electronic" -> sendElectronicMessage(suomiFiViesti);
      case "paperMail" -> sendPaperMailMessage(suomiFiViesti);
      default ->
          throw new IllegalStateException("Unknown messageType: " + suomiFiViesti.getMessageType());
    };
  }

  private String sendElectronicMessage(SuomiFiViesti suomiFiViesti) {
    var request =
        new ElectronicMessageRequest(
            createElectronicPart(suomiFiViesti),
            createExternalId(suomiFiViesti),
            createRecipient(suomiFiViesti),
            createSender());
    var messageId = suomiFiViestitClient.sendElectronicMessage(request);
    log.info("Sent Suomi.fi electronic viesti for tiedote {}", suomiFiViesti.getTiedoteId());
    return messageId;
  }

  private Sender createSender() {
    return new Sender(tiedotuspalveluProperties.suomifiViestit().senderServiceId());
  }

  private Recipient createRecipient(SuomiFiViesti suomiFiViesti) {
    return new Recipient(suomiFiViesti.getHenkilotunnus());
  }

  private String createExternalId(SuomiFiViesti suomiFiViesti) {
    return suomiFiViesti.getTiedoteId().toString();
  }

  private ElectronicPart createElectronicPart(SuomiFiViesti suomiFiViesti) {
    var title = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_OTSIKKO", "fi");
    var body = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_VIESTI", "fi");
    return new ElectronicPart(
        List.of(),
        body,
        "Text",
        "Normal",
        new MessageNotifications(
            new UnreadMessageNotification("Default reminder"), "Organisation and service name"),
        "No one",
        title,
        "Normal");
  }

  private String sendPaperMailMessage(SuomiFiViesti suomiFiViesti) {
    var request =
        new MultichannelMessageRequest(
            createElectronicPart(suomiFiViesti),
            createExternalId(suomiFiViesti),
            createPaperMailPart(suomiFiViesti),
            createRecipient(suomiFiViesti),
            createSender());
    var messageId = suomiFiViestitClient.sendMultichannelMessage(request);
    log.info("Sent Suomi.fi paper mail viesti for tiedote {}", suomiFiViesti.getTiedoteId());
    return messageId;
  }

  private PaperMailPart createPaperMailPart(SuomiFiViesti suomiFiViesti) {
    var posti = tiedotuspalveluProperties.suomifiViestit().posti();
    var senderAddress = tiedotuspalveluProperties.suomifiViestit().senderAddress();

    return new PaperMailPart(
        List.of(),
        true,
        true,
        "Normal",
        new PrintingAndEnvelopingService(
            new PostiMessaging(
                posti.username(), posti.password(), new ContactDetails(posti.contactEmail()))),
        new NewPaperMailRecipient(
            new Address(
                suomiFiViesti.getName(),
                suomiFiViesti.getStreetAddress(),
                suomiFiViesti.getZipCode(),
                suomiFiViesti.getCity(),
                suomiFiViesti.getCountryCode(),
                null)),
        false,
        new NewPaperMailSender(
            new Address(
                senderAddress.name(),
                senderAddress.streetAddress(),
                senderAddress.zipCode(),
                senderAddress.city(),
                senderAddress.countryCode(),
                null)),
        false);
  }
}
