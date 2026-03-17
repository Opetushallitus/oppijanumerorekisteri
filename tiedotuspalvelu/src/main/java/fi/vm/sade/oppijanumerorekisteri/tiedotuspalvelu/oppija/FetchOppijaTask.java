package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViesti;
import java.time.OffsetDateTime;
import java.util.List;
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
  private final OppijanumerorekisteriClient oppijanumerorekisteriClient;
  private final TransactionTemplate transactionTemplate;

  public void execute() {
    log.info("Running FetchOppijaTask");
    for (var tiedote :
        tiedoteRepository.findForProcessingByState(List.of(Tiedote.STATE_OPPIJAN_VALIDOINTI))) {
      try {
        transactionTemplate.executeWithoutResult(
            status -> {
              var oppija = oppijanumerorekisteriClient.getOppija(tiedote.getOppijanumero());
              tiedote.setViesti(
                  SuomiFiViesti.builder()
                      .tiedote(tiedote)
                      .henkilotunnus(oppija.hetu())
                      .name(oppija.etunimet() + " " + oppija.sukunimi())
                      .streetAddress(oppija.katuosoite())
                      .zipCode(oppija.postinumero())
                      .city(oppija.kaupunki())
                      .countryCode("FI")
                      .messageType("electronic")
                      .build());
              tiedote.setProcessedAt(OffsetDateTime.now());
              tiedote.setNextRetry(null);
              tiedote.setRetryCount(0);
              tiedote.setState(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS);
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
