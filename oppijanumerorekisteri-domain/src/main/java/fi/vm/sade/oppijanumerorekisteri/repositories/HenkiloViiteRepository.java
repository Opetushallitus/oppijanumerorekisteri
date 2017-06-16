package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;

import java.util.List;

public interface HenkiloViiteRepository extends QueryDslPredicateExecutor, JpaRepository<HenkiloViite, Long>, HenkiloViiteRepositoryCustom {
    List<HenkiloViite> findBySlaveOid(String slaveOid);
}
