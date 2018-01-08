package fi.vm.sade.oppijanumerorekisteri.clients;

import fi.vm.sade.oppijanumerorekisteri.dto.MuutostietoHetus;

import java.util.List;
import java.util.Optional;

public interface MuutostietoClient {

    List<String> sendHetus(MuutostietoHetus hetus);

}
