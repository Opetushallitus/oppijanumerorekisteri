package fi.vm.sade.oppijanumerorekisteri.services;

public interface OppijaTuontiAsyncService {

    /**
     * Käsittelee oppijoiden tuonnin asynkronisesti.
     *
     * @param id oppijoiden tuonnin id
     */
    void create(long id);

}
