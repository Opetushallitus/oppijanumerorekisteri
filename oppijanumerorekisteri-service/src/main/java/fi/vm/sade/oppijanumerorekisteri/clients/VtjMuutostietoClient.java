package fi.vm.sade.oppijanumerorekisteri.clients;

import java.util.List;
import java.util.concurrent.ExecutionException;

import com.fasterxml.jackson.core.JsonProcessingException;

import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;

public interface VtjMuutostietoClient {
    Long fetchMuutostietoKirjausavain() throws InterruptedException, ExecutionException;

    VtjMuutostietoResponse fetchHenkiloMuutostieto(Long avain, List<String> allHetus)
            throws InterruptedException, ExecutionException, JsonProcessingException;

    List<VtjPerustieto> fetchHenkiloPerustieto(List<String> hetus)
            throws InterruptedException, ExecutionException, JsonProcessingException;
}
