package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SuomiFiViestitService {

  public void sendSuomiFiViesti(Tiedote tiedote) {
    log.info(
        "Sending Suomi.fi viesti for tiedote {} to {}", tiedote.getId(), tiedote.getOppijanumero());
  }
}
