package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.koski;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteProcessingTask;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.KielitutkintotodistusPdf;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class FetchKielitutkintotodistusTask extends TiedoteProcessingTask {

  private final KielitutkintotodistusFetcher kielitutkintotodistusFetcher;

  public FetchKielitutkintotodistusTask(
      TiedoteRepository tiedoteRepository,
      TransactionTemplate transactionTemplate,
      KielitutkintotodistusFetcher kielitutkintotodistusFetcher) {
    super(transactionTemplate, tiedoteRepository);
    this.kielitutkintotodistusFetcher = kielitutkintotodistusFetcher;
  }

  @Override
  protected List<String> statesToProcess() {
    return List.of(Tiedote.STATE_KIELITUTKINTOTODISTUKSEN_NOUTO);
  }

  @Override
  protected void processTiedote(Tiedote tiedote) {
    var todistusBytes =
        kielitutkintotodistusFetcher.fetchPdf(
            tiedote.getTodistusBucketName(), tiedote.getTodistusObjectKey());
    if (todistusBytes.length == 0) {
      throw new RuntimeException(
          "Fetched empty kielitutkintotodistus for tiedote " + tiedote.getId());
    }
    tiedote.setKielitutkintotodistusPdf(
        KielitutkintotodistusPdf.builder().tiedote(tiedote).content(todistusBytes).build());
    tiedote.setState(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA);
  }
}
