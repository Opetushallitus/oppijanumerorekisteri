package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.TuontiApi;

public interface OppijaTuontiAsyncService {

    /**
     * Käsittelee oppijoiden tuonnin asynkronisesti.
     *
     * @param id oppijoiden tuonnin id
     */
    void create(long id, TuontiApi api);

}
