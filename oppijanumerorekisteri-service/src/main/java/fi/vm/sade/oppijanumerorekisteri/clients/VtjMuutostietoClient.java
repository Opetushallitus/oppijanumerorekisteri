package fi.vm.sade.oppijanumerorekisteri.clients;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutionException;

import com.fasterxml.jackson.core.JsonProcessingException;

import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;

public interface VtjMuutostietoClient {
    Long fetchMuutostietoKirjausavain() throws InterruptedException, ExecutionException, IOException;

    VtjMuutostietoResponse fetchHenkiloMuutostieto(Long avain, List<String> allHetus)
            throws InterruptedException, ExecutionException, JsonProcessingException, IOException;

    List<VtjPerustieto> fetchHenkiloPerustieto(List<String> hetus)
            throws InterruptedException, ExecutionException, JsonProcessingException, IOException;

    List<VtjPerustieto> fetchEdellinenKotikuntaPerustieto(List<String> hetus)
            throws InterruptedException, ExecutionException, JsonProcessingException, IOException;
}
