package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteProcessingTask;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale.LocalisationRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.*;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@Slf4j
public class SendSuomiFiViestitTask extends TiedoteProcessingTask {

  private final SuomiFiViestitClient suomiFiViestitClient;
  private final TiedotuspalveluProperties tiedotuspalveluProperties;
  private final LocalisationRepository localisationRepository;

  public SendSuomiFiViestitTask(
      TiedoteRepository tiedoteRepository,
      SuomiFiViestitClient suomiFiViestitClient,
      TiedotuspalveluProperties tiedotuspalveluProperties,
      LocalisationRepository localisationRepository,
      TransactionTemplate transactionTemplate) {
    super(transactionTemplate, tiedoteRepository);
    this.suomiFiViestitClient = suomiFiViestitClient;
    this.tiedotuspalveluProperties = tiedotuspalveluProperties;
    this.localisationRepository = localisationRepository;
  }

  @Override
  protected List<String> statesToProcess() {
    return List.of(
        Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS,
        Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA);
  }

  @Override
  protected void processTiedote(Tiedote tiedote) {
    var viesti = tiedote.getViesti();
    var otsikko =
        localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_OTSIKKO", "omat-viestit", "fi");
    var sisalto =
        localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_VIESTI", "omat-viestit", "fi");
    viesti.setOtsikko(otsikko);
    viesti.setSisalto(sisalto);
    var messageId = sendSuomiFiViesti(viesti);
    viesti.setMessageId(messageId);
    viesti.setProcessedAt(OffsetDateTime.now());
    tiedote.setState(Tiedote.STATE_TIEDOTE_KÄSITELTY);
  }

  @Override
  protected void handleError(Tiedote tiedote, Exception e) {
    if (e instanceof MailboxNotInUseException || e.getCause() instanceof MailboxNotInUseException) {
      var viesti = tiedote.getViesti();
      log.info("SuomiFiViesti {} mailbox not in use, switching to paper mail", viesti.getId());
      transactionTemplate.executeWithoutResult(
          status -> {
            tiedote.setState(Tiedote.STATE_KIELITUTKINTOTODISTUKSEN_NOUTO);
            tiedote.setRetryCount(0);
            tiedote.setNextRetry(null);
            viesti.setMessageType("paperMail");
            tiedoteRepository.save(tiedote);
          });
      return;
    }
    super.handleError(tiedote, e);
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
    var pdfBytes = suomiFiViesti.getTiedote().getKielitutkintotodistusPdf().getContent();
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
    var title =
        localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_OTSIKKO", "omat-viestit", "fi");
    var body =
        localisationRepository.translate("OMAT_VIESTIT_SUOMIFI_VIESTI", "omat-viestit", "fi");
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
