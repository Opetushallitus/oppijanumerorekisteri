package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;

import java.util.List;

public interface HenkiloViiteRepositoryCustom {
    List<HenkiloViiteDto> findBy(HenkiloCriteria criteria);
    List<HenkiloViite> getDuplicateOids(String oid);
    void removeByMasterOidAndSlaveOid(String masterOid, String slaveOid);
}
