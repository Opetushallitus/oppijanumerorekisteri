package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@AllArgsConstructor
public class KielitutkintotodistuksenNoutoTask {
  public void execute() {
    log.info("Running {}", this.getClass().getSimpleName());
    log.info("Finished running {}", this.getClass().getSimpleName());
  }
}
