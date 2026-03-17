package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.LoggingHttpClient;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale.LocalisationRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestitClient suomiFiViestitClient;
  private final TiedotuspalveluProperties tiedotuspalveluProperties;
  private final LocalisationRepository localisationRepository;
  private final TransactionTemplate transactionTemplate;
  private final LoggingHttpClient todistusHttpClient = new LoggingHttpClient("todistus");

  public void execute() {
    log.info("Running SendSuomiFiViestitTask");
    var unprocessed =
        tiedoteRepository.findForProcessingByState(
            List.of(
                Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS,
                Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA));
    var otsikko = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_OTSIKKO", "fi");
    var sisalto = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_VIESTI", "fi");
    for (var tiedote : unprocessed) {
      var viesti = tiedote.getViesti();
      try {
        transactionTemplate.executeWithoutResult(
            status -> {
              viesti.setOtsikko(otsikko);
              viesti.setSisalto(sisalto);
              var messageId = sendSuomiFiViesti(viesti);
              viesti.setMessageId(messageId);
              viesti.setProcessedAt(OffsetDateTime.now());
              tiedote.setNextRetry(null);
              tiedote.setRetryCount(0);
              tiedote.setState(Tiedote.STATE_TIEDOTE_KÄSITELTY);
              tiedoteRepository.save(tiedote);
            });
      } catch (MailboxNotInUseException e) {
        log.info("SuomiFiViesti {} mailbox not in use, switching to paper mail", viesti.getId());
        transactionTemplate.executeWithoutResult(
            status -> {
              tiedote.setState(Tiedote.STATE_KIELITUTKINTOTODISTUKSEN_NOUTO);
              tiedote.setRetryCount(0);
              tiedote.setNextRetry(null);
              viesti.setMessageType("paperMail");
              tiedoteRepository.save(tiedote);
            });
      } catch (Exception e) {
        log.error(
            "Failed to send SuomiFiViesti {} for tiedote {}", viesti.getId(), tiedote.getId(), e);
        transactionTemplate.executeWithoutResult(
            status -> {
              var t = tiedoteRepository.findById(tiedote.getId()).orElse(tiedote);
              t.setRetryCount(t.getRetryCount() + 1);
              long delayInMinutes =
                  (long) Math.min(Math.pow(2, t.getRetryCount() - 1), _24_HOURS_IN_MINUTES);
              t.setNextRetry(OffsetDateTime.now().plusMinutes(delayInMinutes));
              tiedoteRepository.save(t);
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
    log.info("Sent Suomi.fi electronic viesti for tiedote {}", suomiFiViesti.getTiedote().getId());
    return messageId;
  }

  private String sendPaperMailMessage(SuomiFiViesti suomiFiViesti) {
    var pdfBytes = fetchPdf(suomiFiViesti.getTiedote().getTodistusUrl());
    var attachmentId =
        suomiFiViestitClient.sendAttachment("todistus.pdf", "application/pdf", pdfBytes);
    var request =
        new MultichannelMessageRequest(
            createElectronicPart(suomiFiViesti),
            createExternalId(suomiFiViesti),
            createPaperMailPart(suomiFiViesti, attachmentId),
            createRecipient(suomiFiViesti),
            createSender());
    var messageId = suomiFiViestitClient.sendMultichannelMessage(request);
    log.info("Sent Suomi.fi paper mail viesti for tiedote {}", suomiFiViesti.getTiedote().getId());
    return messageId;
  }

  private byte[] fetchPdf(String url) {
    try {
      var request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
      var response = todistusHttpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException(
            "Failed to fetch PDF from " + url + " with status " + response.statusCode());
      }
      return response.body();
    } catch (IOException e) {
      throw new IllegalStateException("Failed to fetch PDF from " + url, e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("PDF fetch interrupted", e);
    }
  }

  private Sender createSender() {
    return new Sender(tiedotuspalveluProperties.suomifiViestit().senderServiceId());
  }

  private Recipient createRecipient(SuomiFiViesti suomiFiViesti) {
    return new Recipient(suomiFiViesti.getHenkilotunnus());
  }

  private String createExternalId(SuomiFiViesti suomiFiViesti) {
    return suomiFiViesti.getTiedote().getId().toString();
  }

  private ElectronicPart createElectronicPart(SuomiFiViesti suomiFiViesti) {
    var title = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_OTSIKKO", "fi");
    var body = localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_VIESTI", "fi");
    return ElectronicPart.builder()
        .attachments(List.of())
        .title(title)
        .body(body)
        .bodyFormat("Text")
        .messageServiceType("Normal")
        .notifications(
            new MessageNotifications(
                new UnreadMessageNotification("Default reminder"), "Organisation and service name"))
        .replyAllowedBy("No one")
        .visibility("Normal")
        .build();
  }

  private PaperMailPart createPaperMailPart(SuomiFiViesti suomiFiViesti, String attachmentId) {
    var posti = tiedotuspalveluProperties.suomifiViestit().posti();
    var senderAddress = tiedotuspalveluProperties.suomifiViestit().senderAddress();
    return new PaperMailPart(
        List.of(new AttachmentReference(attachmentId)),
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
