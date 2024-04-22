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
            Query q = em.createNativeQuery("select distinct hv2.master_oid as masterOid, hv2.slave_oid as henkiloOid " +
                    "        from henkiloViite " +
                    "                 join henkiloViite as hv2 on henkiloViite.master_oid = hv2.master_oid " +
                    "                 join henkilo as h1 on hv2.master_oid = h1.oidhenkilo " +
                    "                 join henkilo as h2 on hv2.slave_oid = h2.oidhenkilo " +
                    "        where henkiloviite.master_oid in ?1 or henkiloviite.slave_oid in ?1", "map_from_native");
            q.setParameter(1, oids);
            return q.getResultList();
        } else {
            Query q = em.createNativeQuery("select distinct henkiloViite.master_oid as masterOid, henkiloViite.slave_oid as henkiloOid " +
                            "        from henkiloViite " +
                            "                 join henkilo as h1 on henkiloViite.master_oid = h1.oidhenkilo " +
                            "                 join henkilo as h2 on henkiloViite.slave_oid = h2.oidhenkilo "
                    , "map_from_native");
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
