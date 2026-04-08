package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.koski;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.KielitutkintotodistusPdf;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@Slf4j
@RequiredArgsConstructor
public class FetchKielitutkintotodistusTask {
  private final TiedoteRepository tiedoteRepository;
  private final TransactionTemplate transactionTemplate;
  private final KielitutkintotodistusFetcher kielitutkintotodistusFetcher;

  public void execute() {
    log.info("Running {}", this.getClass().getSimpleName());
    for (var tiedote :
        tiedoteRepository.findForProcessingByState(
            List.of(Tiedote.STATE_KIELITUTKINTOTODISTUKSEN_NOUTO))) {
      try {
        transactionTemplate.executeWithoutResult(
            status -> {
              var todistusBytes =
                  kielitutkintotodistusFetcher.fetchPdf(
                      tiedote.getTodistusBucketName(), tiedote.getTodistusObjectKey());
              if (todistusBytes.length == 0) {
                throw new RuntimeException(
                    "Fetched empty kielitutkintotodistus for tiedote " + tiedote.getId());
              }
              tiedote.setKielitutkintotodistusPdf(
                  KielitutkintotodistusPdf.builder()
                      .tiedote(tiedote)
                      .content(todistusBytes)
                      .build());
              tiedote.setState(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA);
              tiedoteRepository.save(tiedote);
            });
      } catch (Exception e) {
        log.warn("Failed to fetch kielitutkintotodistus for tiedote {}", tiedote.getId(), e);
      }
    }
    log.info("Finished running {}", this.getClass().getSimpleName());
  }
}
