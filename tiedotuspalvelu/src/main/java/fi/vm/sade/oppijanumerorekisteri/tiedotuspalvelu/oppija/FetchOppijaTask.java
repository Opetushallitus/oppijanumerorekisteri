package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.oppija;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteProcessingTask;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViesti;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class FetchOppijaTask extends TiedoteProcessingTask {

  private final OppijanumerorekisteriClient oppijanumerorekisteriClient;

  public FetchOppijaTask(
      TiedoteRepository tiedoteRepository,
      OppijanumerorekisteriClient oppijanumerorekisteriClient,
      TransactionTemplate transactionTemplate) {
    super(transactionTemplate, tiedoteRepository);
    this.oppijanumerorekisteriClient = oppijanumerorekisteriClient;
  }

  @Override
  protected List<String> statesToProcess() {
    return List.of(Tiedote.STATE_OPPIJAN_VALIDOINTI);
  }

  @Override
  protected void processTiedote(Tiedote tiedote) {
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
    tiedote.setState(Tiedote.STATE_SUOMIFI_VIESTIN_LÄHETYS);
  }
}
