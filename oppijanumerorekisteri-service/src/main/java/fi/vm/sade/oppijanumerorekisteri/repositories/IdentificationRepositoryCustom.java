package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Identification;

public interface IdentificationRepositoryCustom {

    Iterable<Identification> findByHenkiloOid(String henkiloOid);

}
