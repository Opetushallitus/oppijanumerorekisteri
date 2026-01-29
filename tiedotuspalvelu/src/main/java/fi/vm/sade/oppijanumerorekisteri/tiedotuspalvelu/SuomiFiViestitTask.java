package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@AllArgsConstructor
public class SuomiFiViestitTask {

  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestitService suomiFiViestitService;

  @Transactional
  public void execute() {
    log.info("Running SuomiFiViestiTask");
    var unsentTiedotteet = tiedoteRepository.findBySuomiFiViestiNotSent();
    for (var tiedote : unsentTiedotteet) {
      try {
        suomiFiViestitService.sendSuomiFiViesti(tiedote);
        tiedote.setSuomiFiViestiSent(true);
        tiedoteRepository.save(tiedote);
      } catch (Exception e) {
        log.error("Failed to process tiedote {}", tiedote.getId(), e);
      }
    }
    log.info("Finnished running SuomiFiViestiTask");
  }
}
