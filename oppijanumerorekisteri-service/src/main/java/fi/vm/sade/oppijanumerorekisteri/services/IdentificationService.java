package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;

public interface IdentificationService {

    /**
     * Palauttaa henkilön tunnistetiedot.
     *
     * @param oid henkilön oid
     * @return tunnistetiedot
     */
    Iterable<IdentificationDto> listByHenkiloOid(String oid);

    /**
     * Luo henkilölle tunnistetiedon.
     *
     * @param oid henkilö oid
     * @param identification tunnistetieto
     * @return kaikki nykyiset henkilön tunnistetiedot
     */
    Iterable<IdentificationDto> create(String oid, IdentificationDto identification);

}
