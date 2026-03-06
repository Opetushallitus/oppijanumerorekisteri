package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.ApiController.Meta;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViesti;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestiRepository;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@Slf4j
@AllArgsConstructor
public class FetchOppijaTask {

  private static final int _24_HOURS_IN_MINUTES = 60 * 24;
  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestiRepository suomiFiViestiRepository;
  private final OppijanumerorekisteriClient oppijanumerorekisteriClient;
  private final TransactionTemplate transactionTemplate;

  public void execute() {
    log.info("Running FetchOppijaTask");
    var unprocessed = tiedoteRepository.findUnprocessed();
    for (var tiedote : unprocessed) {
      try {
        transactionTemplate.executeWithoutResult(
            status -> {
              var oppija = oppijanumerorekisteriClient.getOppija(tiedote.getOppijanumero());
              var viesti =
                  SuomiFiViesti.builder()
                      .tiedote(tiedote)
                      .henkilotunnus(oppija.hetu())
                      .name(oppija.etunimet() + " " + oppija.sukunimi())
                      .streetAddress(oppija.katuosoite())
                      .zipCode(oppija.postinumero())
                      .city(oppija.kaupunki())
                      .countryCode("FI")
                      .messageType("electronic")
                      .build();
              suomiFiViestiRepository.save(viesti);
              tiedote.setProcessedAt(OffsetDateTime.now());
              tiedote.setNextRetry(null);
              tiedote.setRetryCount(0);
              tiedote.setTiedotestateId(Meta.STATE_SUOMIFI_VIESTI_HETULLISELLE);
              tiedoteRepository.save(tiedote);
            });
      } catch (Exception e) {
        log.error("Failed to fetch oppija for tiedote {}", tiedote.getId(), e);
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
    log.info("Finished running FetchOppijaTask");
  }
}
