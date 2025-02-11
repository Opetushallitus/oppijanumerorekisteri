package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepositoryCustom;
import org.springframework.util.CollectionUtils;

import jakarta.persistence.Query;
import java.util.List;
import java.util.Set;


public class HenkiloViiteRepositoryImpl extends AbstractRepository implements HenkiloViiteRepositoryCustom {

    @Override
    public List<HenkiloViiteDto> findBy(Set<String> oids) {
        if (!CollectionUtils.isEmpty(oids)) {
            var sql = """
                    -- oid refers to master_oid, find all its duplicates
                    select master_oid as masterOid, slave_oid as henkiloOid from henkiloViite where master_oid in ?1
                    -- oid refers to slave_oid, find master_oid and all its duplicates
                    union select master_oid as masterOid, slave_oid as henkiloOid from henkiloViite where master_oid in (
                        select master_oid from henkiloViite where slave_oid in ?1
                    )
                    """;
            Query q = em.createNativeQuery(sql, "map_from_native");
            q.setParameter(1, oids);
            return q.getResultList();
        } else {
            var sql = """
                    select distinct master_oid as masterOid, slave_oid as henkiloOid from henkiloViite
                    """;
            Query q = em.createNativeQuery(sql, "map_from_native");
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
