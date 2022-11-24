package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.ryhmasahkoposti.api.dto.EmailData;

public interface RyhmasahkopostiClient {

    void sendRyhmaSahkoposti(EmailData emaildata);

}
