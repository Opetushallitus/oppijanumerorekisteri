package fi.vm.sade.oppijanumerorekisteri.clients;

import java.util.List;

import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;

public interface VtjMuutostietoClient {
    Long fetchMuutostietoKirjausavain() throws Exception;

    VtjMuutostietoResponse fetchHenkiloMuutostieto(Long avain, List<String> allHetus) throws Exception;
}
