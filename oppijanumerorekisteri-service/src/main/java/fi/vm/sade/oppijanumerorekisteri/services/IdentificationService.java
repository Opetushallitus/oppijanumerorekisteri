package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloVahvaTunnistusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.Collection;

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

    Iterable<IdentificationDto> remove(String oid, IdpEntityId idpEntityId, String identifier);

    /**
     * Käsittelee tunnistamattomat henkilöt liittämälle ne oikeisiin oideihin.
     *
     */
    void identifyHenkilos(Collection<Henkilo> unidentified, Long vtjRequestDelayInMillis);

    void setStrongIdentifiedHetu(String oidHenkilo, HenkiloVahvaTunnistusDto henkiloVahvaTunnistusDto);

    void yksilointiTask();
}
