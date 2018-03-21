package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;

public interface HenkiloViiteRepository extends QuerydslPredicateExecutor, JpaRepository<HenkiloViite, Long>, HenkiloViiteRepositoryCustom {
    List<HenkiloViite> findByMasterOid(String masterOid);
    List<HenkiloViite> findBySlaveOid(String slaveOid);
}
