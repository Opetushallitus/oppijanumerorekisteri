package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;

public interface MuutostietoClient {

    void sendHetus(MuutostietoHetus hetus);

}
