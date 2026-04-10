package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.time.OffsetDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
public abstract class TiedoteProcessingTask {

  private static final int _24_HOURS_IN_MINUTES = 60 * 24;

  protected final TiedoteRepository tiedoteRepository;
  protected final TransactionTemplate transactionTemplate;

  protected TiedoteProcessingTask(
      TransactionTemplate transactionTemplate, TiedoteRepository tiedoteRepository) {
    this.tiedoteRepository = tiedoteRepository;
    this.transactionTemplate = transactionTemplate;
  }

  public void execute() {
    log.info("Running {}", getClass().getSimpleName());
    var tiedotteet = tiedoteRepository.findForProcessingByState(statesToProcess());
    for (var tiedote : tiedotteet) {
      try {
        transactionTemplate.executeWithoutResult(
            status -> {
              processTiedote(tiedote);
              tiedote.setNextRetry(null);
              tiedote.setRetryCount(0);
              tiedoteRepository.save(tiedote);
            });
      } catch (Exception e) {
        handleError(tiedote, e);
      }
    }
    log.info("Finished running {}", getClass().getSimpleName());
  }

  protected abstract List<String> statesToProcess();

  protected abstract void processTiedote(Tiedote tiedote);

  protected void handleError(Tiedote tiedote, Exception e) {
    log.error("Failed to process tiedote {}", tiedote.getId(), e);
    transactionTemplate.executeWithoutResult(
        status -> {
          var t = tiedoteRepository.findById(tiedote.getId()).orElse(tiedote);
          t.setRetryCount(t.getRetryCount() + 1);
          long delay = (long) Math.min(Math.pow(2, t.getRetryCount() - 1), _24_HOURS_IN_MINUTES);
          t.setNextRetry(OffsetDateTime.now().plusMinutes(delay));
          tiedoteRepository.save(t);
        });
  }
}
