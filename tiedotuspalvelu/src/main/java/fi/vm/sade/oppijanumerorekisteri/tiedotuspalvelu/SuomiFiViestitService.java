package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@AllArgsConstructor
public class SuomiFiViestitService {

  private final SuomiFiViestitClient suomiFiViestitClient;
  private final OppijanumerorekisteriClient oppijanumerorekisteriClient;
  private final TiedotuspalveluProperties tiedotuspalveluProperties;
  private final SuomiFiViestiRepository suomiFiViestiRepository;
  private final TiedoteRepository tiedoteRepository;

  public void sendSuomiFiViesti(Tiedote tiedote, SuomiFiViesti suomiFiViesti) {
    var request =
        new SuomiFiViestitElectronicMessageRequest(
            new ElectronicPart(
                List.of(),
                "Katso tiedote: " + tiedote.getUrl(),
                "Text",
                "Normal",
                new MessageNotifications(
                    new UnreadMessageNotification("Default reminder"),
                    "Organisation and service name"),
                "No one",
                "Uusi tiedote",
                "Normal"),
            tiedote.getId().toString(),
            new Recipient(suomiFiViesti.getHenkilotunnus()),
            new Sender(tiedotuspalveluProperties.suomifiViestit().senderServiceId()));
    suomiFiViestitClient.send(request);
    log.info(
        "Sent Suomi.fi viesti for tiedote {} to {}", tiedote.getId(), tiedote.getOppijanumero());
  }
}
