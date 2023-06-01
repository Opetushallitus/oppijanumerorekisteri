package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface HenkiloViiteRepository extends QuerydslPredicateExecutor, JpaRepository<HenkiloViite, Long>, HenkiloViiteRepositoryCustom {
    List<HenkiloViite> findByMasterOid(String masterOid);

    List<HenkiloViite> findBySlaveOid(String slaveOid);

    @Query(value = "with masters as (" +
            "select distinct h.oidhenkilo as oid, hv.master_oid as linked " +
            "from henkilo h " +
            "join henkiloviite hv on hv.master_oid = h.oidhenkilo or hv.slave_oid = h.oidhenkilo " +
            "where h.oidhenkilo in :oids) " +
            "select m.oid, hv.master_oid as linked " +
            "from masters m join henkiloviite hv on hv.slave_oid = m.oid " +
            "union " +
            "select m.oid, hv.slave_oid as linked " +
            "from masters m join henkiloviite hv on hv.master_oid = m.linked " +
            "where hv.slave_oid != m.oid"
            , nativeQuery = true)
    List<Linked> getLinked(@Param("oids") Set<String> oids);

    @Query(value = "select distinct h.oidhenkilo as oid, hv.master_oid as linked " +
            "from henkilo h " +
            "join henkiloviite hv on hv.master_oid = h.oidhenkilo or hv.slave_oid = h.oidhenkilo " +
            "where h.oidhenkilo in :oids", nativeQuery = true)
    List<Linked> getMasters(@Param("oids") Set<String> oids);

    interface Linked {
        String getOid();

        String getLinked();
    }
}
