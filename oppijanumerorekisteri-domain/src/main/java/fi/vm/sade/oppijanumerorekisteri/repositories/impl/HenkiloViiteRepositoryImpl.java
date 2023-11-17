package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepositoryCustom;
import org.springframework.util.CollectionUtils;

import javax.persistence.Query;
import java.util.List;
import java.util.Set;


public class HenkiloViiteRepositoryImpl extends AbstractRepository implements HenkiloViiteRepositoryCustom {
    @Override
    public List<HenkiloViiteDto> findBy(Set<String> oids) {
        if (!CollectionUtils.isEmpty(oids)) {
            Query q = em.createNativeQuery("SELECT DISTINCT masterviite.master_oid AS masteroid, masterviite.slave_oid AS henkilooid FROM henkiloviite" +
                    " JOIN henkiloviite masterviite ON henkiloviite.master_oid = masterviite.master_oid" +
                    " WHERE henkiloviite.master_oid IN ?1 OR henkiloviite.slave_oid IN ?1", "map_from_native");
            q.setParameter(1, oids);
            return q.getResultList();
        } else {
            Query q = em.createNativeQuery("SELECT DISTINCT henkiloviite.master_oid AS masteroid, henkiloviite.slave_oid AS henkilooid FROM henkiloviite ", "map_from_native");
            return q.getResultList();
        }
    }

    @Override
    public void removeByMasterOidAndSlaveOid(String masterOid, String slaveOid) {
        QHenkiloViite qViite = QHenkiloViite.henkiloViite;
        jpa()
                .delete(qViite)
                .where(qViite.masterOid.eq(masterOid).and(qViite.slaveOid.eq(slaveOid)))
                .execute();
    }
}
