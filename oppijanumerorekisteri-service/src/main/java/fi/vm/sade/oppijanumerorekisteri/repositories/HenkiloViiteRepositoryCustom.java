package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;

import java.util.List;
import java.util.Set;

public interface HenkiloViiteRepositoryCustom {
    List<HenkiloViiteDto> findBy(Set<String> oids);
    void removeByMasterOidAndSlaveOid(String masterOid, String slaveOid);
}
