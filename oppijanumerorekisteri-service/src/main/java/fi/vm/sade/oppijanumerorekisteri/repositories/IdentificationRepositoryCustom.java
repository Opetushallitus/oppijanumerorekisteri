package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;

import java.util.List;

public interface IdentificationRepositoryCustom {

    Iterable<Identification> findByHenkiloOid(String henkiloOid);

    List<Identification> findIdentical(IdentificationDto identification);

}
