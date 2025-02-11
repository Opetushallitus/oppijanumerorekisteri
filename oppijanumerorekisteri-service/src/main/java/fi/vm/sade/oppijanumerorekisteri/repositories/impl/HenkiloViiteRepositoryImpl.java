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
                    select distinct master_oid as masterOid, slave_oid as henkiloOid from henkiloViite
                    where (master_oid in ?1 or slave_oid in ?1)
                    and exists (select 1 from henkilo where oidhenkilo = master_oid)
                    and exists (select 1 from henkilo where oidhenkilo = slave_oid)
                    """;
            Query q = em.createNativeQuery(sql, "map_from_native");
            q.setParameter(1, oids);
            return q.getResultList();
        } else {
            var sql = """
                    select distinct master_oid as masterOid, slave_oid as henkiloOid from henkiloViite
                    where exists (select 1 from henkilo where oidhenkilo = henkiloViite.master_oid)
                    and exists (select 1 from henkilo where oidhenkilo = henkiloViite.slave_oid)
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
