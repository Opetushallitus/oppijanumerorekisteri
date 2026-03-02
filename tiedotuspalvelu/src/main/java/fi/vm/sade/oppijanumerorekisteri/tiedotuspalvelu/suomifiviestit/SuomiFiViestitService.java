package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale.LocalisationRepository;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@AllArgsConstructor
public class SuomiFiViestitService {

  private final SuomiFiViestitClient suomiFiViestitClient;
  private final TiedotuspalveluProperties tiedotuspalveluProperties;
  private final LocalisationRepository localisationRepository;

  public String sendSuomiFiViesti(SuomiFiViesti suomiFiViesti) {
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
