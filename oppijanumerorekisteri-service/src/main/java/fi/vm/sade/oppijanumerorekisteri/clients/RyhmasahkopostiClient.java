package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.ryhmasahkoposti.api.dto.EmailData;
import org.apache.http.HttpResponse;

public interface RyhmasahkopostiClient {

    void sendRyhmaSahkoposti(EmailData emaildata);

}
